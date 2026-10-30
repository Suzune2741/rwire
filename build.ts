/**
 * mruby/cのコード(文字列)をビルドしてバイトコード文字列を取得する
 */
export const build = async (
  nodeName: string,
  code: string,
  version: string,
) => {
  const rbPath = `build/${nodeName}.rb`;
  const mrbPath = `build/${nodeName}.mrb`;

  await Deno.remove(mrbPath).catch(() => {});
  await Deno.writeTextFile(rbPath, code);

  const mrbcPath = Deno.env.get("MRBC_PATH");
  const command = version ? `${mrbcPath}/mrbc-${version}` : "mrbc";

  const { code: exitCode, stderr } = await new Deno.Command(command, {
    args: [rbPath],
  }).output();

  if (exitCode !== 0) {
    throw new Error(
      `mrbc failed for ${nodeName}: ${new TextDecoder().decode(stderr)}`,
    );
  }

  const byteCode = await Deno.readFile(mrbPath);
  return [...byteCode]
    .map((v) => `\\x${v.toString(16).padStart(2, "0")}`)
    .join("");
};
