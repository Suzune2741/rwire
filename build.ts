/**
 * mruby/cのコード(文字列)をビルドしてバイトコード文字列を取得する
 */
export const build = async (nodeName: string, code: string) => {
  try {
    await Deno.remove(`${nodeName}.rb`);
  } catch (e) {
    // console.log(e);
  }
  await Deno.writeTextFile(`build/${nodeName}.rb`, code, { create: true });

  const cmd = new Deno.Command("mrbc", { args: [`build/${nodeName}.rb`] });
  await cmd.output();

  const byteCode = await Deno.readFile(`build/${nodeName}.mrb`);

  return [...new Uint8Array(byteCode)]
    .map((v) => `\\x${v.toString(16).padStart(2, "0")}`)
    .join("");
};

const createTaskCode = (name: string, code: string) => {
  return `$${name} = Task.create("${code}")`;
};
