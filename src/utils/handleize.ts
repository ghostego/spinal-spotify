import slugify from "slugify"

export const handleize = (string: string) => slugify(string, { lower: true, replacement: '_' });