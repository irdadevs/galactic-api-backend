export class HealthQuery {
  constructor() {}

  async execute(feat: string): Promise<{ ok: boolean; feat: string }> {
    return { ok: true, feat: feat };
  }
}
