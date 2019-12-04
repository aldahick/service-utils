export const promiseSome = <T>(promises: Promise<T>[]): Promise<(T | Error)[]> =>
  Promise.all(promises.map(p => p.catch(e => e)));
