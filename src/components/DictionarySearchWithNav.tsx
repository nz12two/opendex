import DictionarySearch from "./DictionarySearch";
import type { DictionaryEntry } from "../data/dictionary";

interface DictionarySearchWithNavProps {
  entries: DictionaryEntry[];
  placeholder?: string;
}

export default function DictionarySearchWithNav({
  entries,
  placeholder,
}: DictionarySearchWithNavProps) {
  const handleSelect = (entry: DictionaryEntry) => {
    const slug = entry.term
      .toLowerCase()
      .replace(/[\s()]+/g, "-")
      .replace(/[^a-z0-9-]+/g, "")
      .replace(/-+/g, "-");
    window.location.href = `/opendex/dicionario/${slug}/`;
  };

  return (
    <DictionarySearch
      entries={entries}
      onSelect={handleSelect}
      placeholder={placeholder}
    />
  );
}
