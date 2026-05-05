/**
 * Clamps `Date.now` to the nearest 100ms
 * @returns The current time
 * @see {@link https://2019.www.torproject.org/projects/torbrowser/design/#:~:text=Timing-based%20Side%20Channels The Design and Implementation of the Tor Browser}
 */
export function dateNow(): number {
    return Math.floor(Date.now() / 100) * 100;
}
