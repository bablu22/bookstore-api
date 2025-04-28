import { Knex } from 'knex';

interface ParamMapping {
  [key: string]: string;
}

class QueryBuilder<T> {
  public queryBuilder: Knex.QueryBuilder;
  public query: Record<string, unknown>;
  public tableName: string;
  private paramMappings: ParamMapping;
  private allowedColumns: string[] = [];
  private knexInstance: Knex;

  constructor(
    knexInstance: Knex,
    tableName: string,
    query: Record<string, unknown>,
    paramMappings: ParamMapping = {},
    allowedColumns: string[] = []
  ) {
    this.knexInstance = knexInstance;
    this.queryBuilder = knexInstance(tableName);
    this.query = query;
    this.tableName = tableName;
    this.paramMappings = paramMappings;
    this.allowedColumns = allowedColumns;
  }

  // Async initialization to fetch table columns if needed
  async initialize() {
    // If no allowed columns were specified, fetch from the database schema
    if (this.allowedColumns.length === 0) {
      try {
        // Get column information from the database
        const columnInfo = await this.knexInstance(this.tableName).columnInfo();
        this.allowedColumns = Object.keys(columnInfo);
      } catch (error) {
        console.error(`Failed to fetch column info for table ${this.tableName}:`, error);
        // Continue with empty allowed columns - will validate against mappings only
      }
    }

    return this;
  }

  // Check if a parameter is valid - either a known column or has a mapping
  isValidParameter(param: string): boolean {
    // Parameter is valid if:
    // 1. It's in the allowed columns list
    // 2. It has a mapping to a valid column
    // 3. It's one of our special parameters
    const specialParams = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    if (specialParams.includes(param)) {
      return true;
    }

    if (this.allowedColumns.includes(param)) {
      return true;
    }

    if (param in this.paramMappings) {
      const mappedColumn = this.paramMappings[param];
      return this.allowedColumns.includes(mappedColumn);
    }

    return false;
  }

  // Filter out invalid parameters
  sanitizeQuery() {
    const sanitizedQuery: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(this.query)) {
      if (this.isValidParameter(key)) {
        sanitizedQuery[key] = value;
      }
      // Invalid parameters are simply ignored
    }

    this.query = sanitizedQuery;
    return this;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm as string;

    if (searchTerm) {
      this.queryBuilder = this.queryBuilder.where((builder) => {
        searchableFields.forEach((field, index) => {
          if (index === 0) {
            builder.whereILike(field, `%${searchTerm}%`);
          } else {
            builder.orWhereILike(field, `%${searchTerm}%`);
          }
        });
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((field) => delete queryObj[field]);

    // Apply each filter condition with parameter mapping support
    Object.entries(queryObj).forEach(([key, value]) => {
      // Skip invalid parameters
      if (!this.isValidParameter(key)) return;

      // Check if this parameter should be mapped to a different column name
      const dbColumn = this.paramMappings[key] || key;
      this.queryBuilder = this.queryBuilder.where(
        dbColumn,
        value as string | number | boolean | null
      );
    });

    return this;
  }

  sort() {
    const sortParam = this?.query?.sort as string;

    if (sortParam) {
      const sortFields = sortParam.split(',');

      sortFields.forEach((field) => {
        let actualField = field;
        let direction: 'asc' | 'desc' = 'asc';

        if (field.startsWith('-')) {
          actualField = field.substring(1);
          direction = 'desc';
        }

        // Skip invalid sort fields
        if (!this.isValidParameter(actualField)) return;

        // Map the field name if a mapping exists
        const dbField = this.paramMappings[actualField] || actualField;
        this.queryBuilder = this.queryBuilder.orderBy(dbField, direction);
      });
    } else {
      // Default sort by 'id' instead of 'createdAt' since 'createdAt' might not exist
      this.queryBuilder = this.queryBuilder.orderBy('id', 'desc');
    }

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 20;
    const offset = (page - 1) * limit;

    this.queryBuilder = this.queryBuilder.offset(offset).limit(limit);

    return this;
  }

  fields() {
    const fields = this?.query?.fields as string;

    if (fields) {
      const validFields = fields
        .split(',')
        .filter((field) => this.isValidParameter(field))
        .map((field) => this.paramMappings[field] || field);

      if (validFields.length > 0) {
        this.queryBuilder = this.queryBuilder.select(validFields);
      } else {
        // Default to selecting all if no valid fields
        this.queryBuilder = this.queryBuilder.select('*');
      }
    } else {
      this.queryBuilder = this.queryBuilder.select('*');
    }

    return this;
  }

  async countTotal() {
    // Clone the query builder to keep the where conditions but reset limit/offset
    const countQuery = this.queryBuilder
      .clone()
      .clearSelect()
      .clearOrder()
      .offset(0)
      .limit(Number.MAX_SAFE_INTEGER);

    // Count the total records matching the filters
    const countResult = await countQuery.count({ count: '*' });
    const total = Number(countResult[0].count);

    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 20;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage
    };
  }

  async getResult(): Promise<T[]> {
    return this.queryBuilder as unknown as T[];
  }
}

export default QueryBuilder;
