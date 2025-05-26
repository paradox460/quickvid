export async function convenientCommand(command: string, ...args: string[]) {
  const exec = new Deno.Command(command, { args });

  const { code, stdout, stderr } = await exec.output();
  if (code !== 0) {
    const err = new TextDecoder().decode(stderr);
    throw new Error(`${command} failed with code ${code}:\n${err}`);
  }

  return new TextDecoder().decode(stdout);
}

export async function convenientSpawn(command: string, ...args: string[]) {
  const exec = new Deno.Command(command, { args });
  try {
    const child = exec.spawn();
    child.ref();
    return await child.output();
  } catch (error) {
    console.error(`${command} failed: `, error);
    Deno.exit(4);
  }
}
