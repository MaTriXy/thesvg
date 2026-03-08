// ANSI color helpers - no external deps

const ESC = "\x1b";

export const colors = {
  reset: `${ESC}[0m`,
  bold: `${ESC}[1m`,
  dim: `${ESC}[2m`,

  // Foreground
  black: `${ESC}[30m`,
  red: `${ESC}[31m`,
  green: `${ESC}[32m`,
  yellow: `${ESC}[33m`,
  blue: `${ESC}[34m`,
  magenta: `${ESC}[35m`,
  cyan: `${ESC}[36m`,
  white: `${ESC}[37m`,
  gray: `${ESC}[90m`,
} as const;

export function colorize(color: keyof typeof colors, text: string): string {
  return `${colors[color]}${text}${colors.reset}`;
}

export function success(text: string): string {
  return `${colors.green}${colors.bold}✓${colors.reset} ${text}`;
}

export function error(text: string): string {
  return `${colors.red}${colors.bold}✗${colors.reset} ${colors.red}${text}${colors.reset}`;
}

export function warn(text: string): string {
  return `${colors.yellow}${colors.bold}!${colors.reset} ${colors.yellow}${text}${colors.reset}`;
}

export function info(text: string): string {
  return `${colors.cyan}${colors.bold}→${colors.reset} ${text}`;
}

export function header(text: string): string {
  return `${colors.bold}${colors.white}${text}${colors.reset}`;
}

export function dim(text: string): string {
  return `${colors.dim}${text}${colors.reset}`;
}
