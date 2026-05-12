export async function fetchCoverByTitleAuthor(
  titolo: string,
  autore: string
): Promise<string | null> {
  try {
    const olRes = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(titolo)}&author=${encodeURIComponent(autore)}&limit=1&fields=cover_i`
    );
    const olData = await olRes.json();
    const coverId = olData.docs?.[0]?.cover_i;
    if (coverId) {
      return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    }

    const gbRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(titolo)}+inauthor:${encodeURIComponent(autore)}&maxResults=1`
    );
    const gbData = await gbRes.json();
    const thumbnail = gbData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail?.replace(
      "http:",
      "https:"
    );
    return thumbnail ?? null;
  } catch {
    return null;
  }
}
