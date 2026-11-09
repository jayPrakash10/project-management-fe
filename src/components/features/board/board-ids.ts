/** Droppable ids for board columns (kept apart from task ids, which are UUIDs). */
export const NO_SECTION_ID = 'column:none';

export function columnId(sectionId: string) {
  return `column:${sectionId}`;
}
