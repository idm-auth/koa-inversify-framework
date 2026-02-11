export const updatedAtMiddleware = async function (this: {
  getUpdate: () => unknown;
}) {
  const update = this.getUpdate();
  if (update && typeof update === 'object' && !Array.isArray(update)) {
    const updateObj = update as Record<string, unknown>;
    if (!updateObj.metadata) {
      updateObj.metadata = {};
    }
    (updateObj.metadata as Record<string, unknown>).updatedAt = new Date();
  }
};
