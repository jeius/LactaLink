/**
 * A utility class to track created records during testing.
 *
 * @description
 * It maintains a map where the key is the collection name and the
 * value is a set of record IDs that were created during tests.
 * This allows for easy cleanup after tests are run.
 *
 */
export class RecordsTracker<TKey, TValue> {
  private recordsMap: Map<TKey, Set<TValue>> = new Map();

  /**
   * @constructor
   * Initializes the RecordsTracker with an optional initial map of records.
   *
   * @param initialMap - An optional map to initialize the tracker with existing records.
   * If not provided, the tracker starts with an empty map.
   *
   */
  constructor(initialMap?: Map<TKey, Set<TValue>>) {
    if (initialMap) {
      this.recordsMap = initialMap;
    }
  }

  /**
   * Tracks a created record by adding its ID to the set associated with the
   * collection.
   *
   * @param collection - The name of the collection where the record was created.
   * @param id - The ID of the created record to track.
   *
   * @example
   * ```ts
   * const tracker = new RecordsTracker<string, string>();
   * tracker.track('users', 'user123');
   * tracker.track('posts', 'post456');
   * ```
   */
  track(collection: TKey, id: TValue) {
    if (!this.recordsMap.has(collection)) {
      this.recordsMap.set(collection, new Set());
    }
    this.recordsMap.get(collection)?.add(id);
  }

  /**
   * Retrieves the set of tracked record IDs for a given collection.
   *
   * @param collection - The name of the collection to retrieve tracked IDs for.
   * @returns A set of record IDs that were tracked for the specified collection,
   * or undefined if no records were tracked.
   *
   * @example
   * ```ts
   * const tracker = new RecordsTracker<string, string>();
   * tracker.track('users', 'user123');
   * const userIds = tracker.getIDs('users'); // Returns Set { 'user123' }
   * const postIds = tracker.getIDs('posts'); // Returns undefined
   * ```
   */
  getIDs(collection: TKey): Set<TValue> | undefined {
    return this.recordsMap.get(collection);
  }

  /**
   * Retrieves the entire map of tracked records.
   *
   * @returns A map where the key is the collection name and the value is a set of
   * record IDs that were tracked.
   */
  getAllRecords(): Map<TKey, Set<TValue>> {
    return this.recordsMap;
  }

  /**
   * Clears all tracked records from the map.
   */
  clear() {
    this.recordsMap.clear();
  }
}
