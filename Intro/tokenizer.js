import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base);
const text = 'hello, how are you??';
const tokens = enc.encode(text)

// console.log(tokens)

const inputTokens = [ 24912, 11, 1495, 553, 481, 6961 ]
const decode = enc.decode(inputTokens)
console.log(decode)