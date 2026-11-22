import bcrypt from "bcryptjs";
import { stdin, stdout } from "node:process";

function readHidden(prompt: string) {
  if (!stdin.isTTY) {
    return Promise.reject(new Error("شغّل هذا الأمر من نافذة طرفية تفاعلية."));
  }

  return new Promise<string>((resolve, reject) => {
    let password = "";
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();

    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };

    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("تم إلغاء إدخال كلمة المرور."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(password);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          password = password.slice(0, -1);
        } else {
          password += character;
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const password = await readHidden("كلمة مرور المسؤول (12 حرفاً على الأقل): ");
  if (password.length < 12) {
    throw new Error("يجب أن تتكون كلمة المرور من 12 حرفاً على الأقل.");
  }
  const hash = await bcrypt.hash(password, 12);
  console.info(`ADMIN_PASSWORD_HASH=${hash}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "تعذّر إنشاء الهاش.");
  process.exitCode = 1;
});
