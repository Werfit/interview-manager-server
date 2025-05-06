export type Success<T> = {
  success: true;
  data: T;
};

export type Failure<E> = {
  success: false;
  error: E;
};

export const tryCatch = async <T, E = Error>(
  function_: () => Promise<T>,
): Promise<[true, T] | [false, E]> => {
  try {
    const data = await function_();

    return [true, data];
  } catch (error) {
    return [false, error as E];
  }
};
