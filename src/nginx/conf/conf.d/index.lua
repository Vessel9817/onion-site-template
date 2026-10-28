local _M = {}

-- Converts variable types to a boolean based on heuristics
function _M.to_boolean(v)
    local falsy = v == false or v == 0 or v == '' or v == '0' or v == 'false' or v == 'no' or v == 'off'

    if falsy then
        return false
    else
        return true
    end
end

-- Removes leading and trailing whitespace.
function _M.trim(s)
    -- https://stackoverflow.com/a/51181334
    return string.gsub(s, '^%s*(.-)%s*$', '%1')
end

-- Removes ALL whitespace. Prevents HTTP-Splitting.
-- https://gixy.getpagespeed.com/checks/http-splitting/
function _M.trim_all(s)
    -- https://stackoverflow.com/a/10460780
    return string.gsub(s, '%s+', '')
end

-- Returns the PROXY_ADDRESS environment variable
function _M.get_proxy_address()
    return _M.trim_all(os.getenv('PROXY_ADDRESS'))
end

-- Requires elevated privileges to read the hostname file
function _M.get_onion_hostname()
    local file, msg = io.open('/run/secrets/hostname', 'r')

    -- Validating file can be read
    if file == nil then
        ngx.log(ngx.ERROR, string.format("Couldn't read hostname file: %s", msg))

        return ''
    end

    local hostname = string.lower(_M.trim_all(file:read()))

    io.close(file)

    -- Validating Onion v3 address
    local pattern = '^' .. string.rep('%w', 56) .. '%.onion'

    if string.match(hostname, pattern) == nil then
        ngx.log(ngx.WARN, string.format('Ignoring invalid hostname: %s', hostname))

        return ''
    end

    return string.format('http://%s', hostname)
end

-- Should be called before workers fork to instantiate the shared config
function _M.set_onion_location()
    if _M.to_boolean(os.getenv('USE_ONION_LOCATION')) then
        ngx.shared.onion_domain = _M.get_onion_hostname()
    else
        ngx.shared.onion_domain = ''
    end
end

-- Should be called by forked workers
function _M.get_onion_location()
    -- Validating whether use of this header is permitted
    if ngx.shared.onion_domain == '' then
        return ''
    end

    -- Validating request domain is not an onion address
    if string.match(ngx.var.host, '%.onion$') ~= nil then
        return ''
    end

    return string.format('%s%s', ngx.shared.onion_domain, ngx.var.request_uri)
end

-- Rejects bytes in the request URI and headers that upstream rejects unusually.
-- Returns `nil` if validation passed
function _M.reject_upstream_bytes()
    -- Node's HTTP parser refuses these bytes with an empty reply
    if ngx.var.request_uri:find('[\128-\255]') then
        return ngx.exit(ngx.HTTP_BAD_REQUEST)
    end

    -- 0 reads every header, not just the first 100; max_headers caps them
    for _, value in pairs(ngx.req.get_headers(0)) do
        if type(value) == 'table' then
            value = table.concat(value)
        end

        if value:find('[\1-\8\11-\31\127]') then
            return ngx.exit(ngx.HTTP_BAD_REQUEST)
        end
    end
end

return _M
