function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(toNumber(value, minimum), minimum), maximum);
}

function tokenize(expression) {
  const input = `${expression ?? ""}`;
  const tokens = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    const numberMatch = input.slice(index).match(/^\d+(?:\.\d+)?/);
    if (numberMatch) {
      tokens.push({ type: "number", value: Number(numberMatch[0]) });
      index += numberMatch[0].length;
      continue;
    }

    const identifierMatch = input.slice(index).match(/^[A-Za-z_][A-Za-z0-9_.]*/);
    if (identifierMatch) {
      tokens.push({ type: "identifier", value: identifierMatch[0] });
      index += identifierMatch[0].length;
      continue;
    }

    if ("+-*/%(),".includes(char)) {
      tokens.push({ type: char, value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unsupported formula token "${char}"`);
  }

  return tokens;
}

function resolvePath(context, path) {
  if (!path) return 0;
  const parts = `${path}`.split(".").filter(Boolean);
  let value = context;
  for (const part of parts) {
    if (value === null || value === undefined) return 0;
    value = value[part];
  }
  return value ?? 0;
}

function callFormulaFunction(name, args) {
  const normalized = `${name ?? ""}`.trim().toLowerCase();
  switch (normalized) {
    case "min":
      return Math.min(...args.map((value) => toNumber(value, 0)));
    case "max":
      return Math.max(...args.map((value) => toNumber(value, 0)));
    case "abs":
      return Math.abs(toNumber(args[0], 0));
    case "floor":
      return Math.floor(toNumber(args[0], 0));
    case "ceil":
      return Math.ceil(toNumber(args[0], 0));
    case "round":
      return Math.round(toNumber(args[0], 0));
    case "pow":
      return Math.pow(toNumber(args[0], 0), toNumber(args[1], 0));
    case "clamp":
      return clamp(args[0], toNumber(args[1], 0), toNumber(args[2], 0));
    case "if":
      return args[0] ? args[1] : args[2];
    case "gt":
      return toNumber(args[0], 0) > toNumber(args[1], 0);
    case "gte":
      return toNumber(args[0], 0) >= toNumber(args[1], 0);
    case "lt":
      return toNumber(args[0], 0) < toNumber(args[1], 0);
    case "lte":
      return toNumber(args[0], 0) <= toNumber(args[1], 0);
    case "eq":
      return toNumber(args[0], 0) === toNumber(args[1], 0);
    case "neq":
      return toNumber(args[0], 0) !== toNumber(args[1], 0);
    default:
      throw new Error(`Unknown formula function "${name}"`);
  }
}

class FormulaParser {
  constructor(tokens, context) {
    this.tokens = tokens;
    this.context = context ?? {};
    this.index = 0;
  }

  parse() {
    const result = this.parseExpression();
    if (this.peek()) {
      throw new Error(`Unexpected token "${this.peek().value}"`);
    }
    return result;
  }

  peek(offset = 0) {
    return this.tokens[this.index + offset] ?? null;
  }

  consume(expectedType = null) {
    const token = this.peek();
    if (!token) {
      throw new Error("Unexpected end of formula");
    }
    if (expectedType && token.type !== expectedType) {
      throw new Error(`Expected token "${expectedType}" but found "${token.type}"`);
    }
    this.index += 1;
    return token;
  }

  parseExpression() {
    return this.parseAdditive();
  }

  parseAdditive() {
    let value = this.parseMultiplicative();
    while (this.peek()?.type === "+" || this.peek()?.type === "-") {
      const operator = this.consume().type;
      const right = this.parseMultiplicative();
      value =
        operator === "+"
          ? toNumber(value, 0) + toNumber(right, 0)
          : toNumber(value, 0) - toNumber(right, 0);
    }
    return value;
  }

  parseMultiplicative() {
    let value = this.parseUnary();
    while (["*", "/", "%"].includes(this.peek()?.type)) {
      const operator = this.consume().type;
      const right = this.parseUnary();
      if (operator === "*") value = toNumber(value, 0) * toNumber(right, 0);
      if (operator === "/") value = toNumber(right, 0) === 0 ? 0 : toNumber(value, 0) / toNumber(right, 0);
      if (operator === "%") value = toNumber(right, 0) === 0 ? 0 : toNumber(value, 0) % toNumber(right, 0);
    }
    return value;
  }

  parseUnary() {
    if (this.peek()?.type === "+") {
      this.consume("+");
      return toNumber(this.parseUnary(), 0);
    }
    if (this.peek()?.type === "-") {
      this.consume("-");
      return -toNumber(this.parseUnary(), 0);
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of formula");

    if (token.type === "number") {
      return this.consume("number").value;
    }

    if (token.type === "identifier") {
      const identifier = this.consume("identifier").value;
      if (this.peek()?.type === "(") {
        this.consume("(");
        const args = [];
        if (this.peek()?.type !== ")") {
          while (true) {
            args.push(this.parseExpression());
            if (this.peek()?.type === ",") {
              this.consume(",");
              continue;
            }
            break;
          }
        }
        this.consume(")");
        return callFormulaFunction(identifier, args);
      }
      return resolvePath(this.context, identifier);
    }

    if (token.type === "(") {
      this.consume("(");
      const value = this.parseExpression();
      this.consume(")");
      return value;
    }

    throw new Error(`Unexpected token "${token.value}"`);
  }
}

export function evaluateNumericFormula(expression, context = {}, fallback = 0) {
  const normalizedExpression = `${expression ?? ""}`.trim();
  if (!normalizedExpression) return toNumber(fallback, 0);

  try {
    const tokens = tokenize(normalizedExpression);
    const parser = new FormulaParser(tokens, context);
    const result = parser.parse();
    return toNumber(result, fallback);
  } catch (error) {
    console.warn(`Pok Role formula evaluation failed for "${normalizedExpression}":`, error);
    return toNumber(fallback, 0);
  }
}
