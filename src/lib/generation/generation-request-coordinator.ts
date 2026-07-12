export type GenerationRequestIdentity = {
  id: number;
  signal: AbortSignal;
};

export class GenerationRequestCoordinator {
  private activeId = 0;
  private controller: AbortController | null = null;

  begin(): GenerationRequestIdentity {
    this.invalidate();
    this.controller = new AbortController();
    return { id: this.activeId, signal: this.controller.signal };
  }

  invalidate(): void {
    this.activeId += 1;
    this.controller?.abort();
    this.controller = null;
  }

  isCurrent(id: number): boolean {
    return this.controller !== null && this.activeId === id;
  }

  finish(id: number): boolean {
    if (!this.isCurrent(id)) return false;
    this.controller = null;
    return true;
  }

  dispose(): void {
    if (this.controller) this.invalidate();
  }
}

export function disposeGenerationOnRouteExit(
  coordinator: GenerationRequestCoordinator,
  createPathname: string,
  currentPathname: string,
): boolean {
  if (currentPathname === createPathname) return false;
  coordinator.dispose();
  return true;
}
