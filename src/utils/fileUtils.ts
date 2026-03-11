/**
 * Triggers a browser file download for a JSON string payload.
 * @param filename - The suggested file name for the downloaded file.
 * @param content  - The JSON string content to download.
 */
export function downloadJSON( filename: string, content: string ): void
{
    const blob = new Blob( [ content ], { type: 'application/json' } );
    const url = URL.createObjectURL( blob );
    const a = document.createElement( 'a' );
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL( url );
}
