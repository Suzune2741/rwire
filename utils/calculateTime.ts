/**
 * 時間と単位から出力するsleepを返す変数
 * @param untis  時間の単位
 * @param duration  時間
 * @returns  出力する文字列
 */
export const calculateTime = (units: string, duration: string): string => {
  const timeoutValue = Number(duration);
  switch (units) {
    case "s":
    case "seconds":
      return `sleep ${timeoutValue}`;
    case "ms":
    case "milliseconds":
      return `sleep_ms ${timeoutValue}`;
    case "min":
    case "minutes":
      return `sleep ${timeoutValue} * 60`;
    case "hr":
    case "hours":
      return `sleep ${timeoutValue} * 60 * 60`;
    case "days":
      return `sleep ${timeoutValue} * 60 * 60 * 24`;
    default:
      throw new Error("Invalid timeout unit");
  }
};
