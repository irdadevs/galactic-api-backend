type ChalkChain = ((value: string) => string) & {
  bold: (value: string) => string;
};

function chain(): ChalkChain {
  const fn = ((value: string) => value) as ChalkChain;
  fn.bold = (value: string) => value;
  return fn;
}

const chalk = {
  hex: () => chain(),
  green: chain(),
  red: chain(),
  yellow: chain(),
  cyan: chain(),
};

export default chalk;
