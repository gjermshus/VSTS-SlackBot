export const Log = (msg: string): void => {
    let now: string = new Date().toISOString();
    console.log(`${now}: ${msg}`);
}