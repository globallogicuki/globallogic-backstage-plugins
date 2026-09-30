export interface Config {
  techInsightsOverview?: {
    /**
     * How category tiles on the overview page score the catalog.
     *
     * - `absolute` (default): components passing every check in the category.
     * - `cumulative`: passing check results over all check results in the
     *   category, so ten components each passing two of four checks show 50%.
     * @visibility frontend
     */
    categoryAggregation?: 'absolute' | 'cumulative';
  };
}
