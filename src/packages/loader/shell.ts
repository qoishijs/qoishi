import type { OpenExternalOptions, ShortcutDetails } from 'electron'
import type { Context } from 'qoishi'
import { shell } from 'electron'
import { Service } from 'qoishi'

declare module 'qoishi' {
  interface Context {
    shell: ShellService
  }
}

/** @see https://electronjs.org/docs/api/shell */
export default class ShellService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'shell')
  }

  /**
   * Play the beep sound.
   */
  beep(): void {
    shell.beep()
  }

  /**
   * Open the given external protocol URL in the desktop's default manner. (For
   * example, mailto: URLs in the user's default mail agent).
   */
  async openExternal(url: string, options?: OpenExternalOptions): Promise<void> {
    await shell.openExternal(url, options)
  }

  /**
   * Resolves with a string containing the error message corresponding to the failure
   * if a failure occurred, otherwise "".
   *
   * Open the given file in the desktop's default manner.
   */
  async openPath(path: string): Promise<string> {
    return await shell.openPath(path)
  }

  /**
   * Resolves the shortcut link at `shortcutPath`.
   *
   * An exception will be thrown when any error happens.
   *
   * @platform win32
   */
  readShortcutLink(shortcutPath: string): ShortcutDetails {
    return shell.readShortcutLink(shortcutPath)
  }

  /**
   * Show the given file in a file manager. If possible, select the file.
   */
  showItemInFolder(fullPath: string): void {
    shell.showItemInFolder(fullPath)
  }

  /**
   * Resolves when the operation has been completed. Rejects if there was an error
   * while deleting the requested item.
   *
   * This moves a path to the OS-specific trash location (Trash on macOS, Recycle Bin
   * on Windows, and a desktop-environment-specific location on Linux).
   */
  async trashItem(path: string): Promise<void> {
    await shell.trashItem(path)
  }

  /**
   * Whether the shortcut was created successfully.
   *
   * Creates or updates a shortcut link at `shortcutPath`.
   *
   * @platform win32
   */
  writeShortcutLink(shortcutPath: string, options: ShortcutDetails): boolean
  writeShortcutLink(shortcutPath: string, operation: 'create' | 'update' | 'replace', options: ShortcutDetails): boolean
  writeShortcutLink(shortcutPath: string, ...args): boolean {
    // @ts-ignore
    return shell.writeShortcutLink(shortcutPath, ...args)
  }
}
