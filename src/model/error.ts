export class PlaylistUnavailableError extends Error { }

export class PlaylistCandidatesError extends Error {
  public readonly unavailable: boolean

  constructor(failures: Error[]) {
    const details = [...new Set(failures.map((error) => error.message))]
    super(`All playlist candidates exhausted (${failures.length}): ${details.join('; ')}`)
    this.unavailable = failures.every((error) => error instanceof PlaylistUnavailableError)
  }
}
