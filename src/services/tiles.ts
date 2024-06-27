import { tilesApi } from "../repositories/tiles";

export default async function getTiles(
  targetURL: string,
  params?: { [key: string]: string }
): Promise<{ data: any; headers: { [key: string]: string } }> {
  try {
    const { data, headers } = await tilesApi.get(targetURL, {
      params: params,
      responseType: "arraybuffer",
    });

    return { data, headers } as {
      data: any;
      headers: { [key: string]: string };
    };
  } catch (error) {
    throw error;
  }
}
