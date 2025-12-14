import {
  Bus,
  Route,
  Stop,
} from "@school-management/backend-core/models/index.js";
import {
  findAllBySchool,
  findByIdAndSchool,
  createWithSchool,
  updateByIdAndSchool,
} from "@school-management/admission/dbCommands/genericDbCommands.js";

/**
 * Get all buses for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of buses
 */
export const getAllBuses = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Route,
        as: "route",
        attributes: ["route_name", "start_time", "end_time"],
      },
    ],
    order: [["bus_number", "ASC"]],
    ...options,
  };

  return await findAllBySchool(
    Bus,
    schoolId,
    { is_active: true },
    defaultOptions
  );
};

/**
 * Get a single bus by ID
 * @param {string} busId - Bus UUID
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Bus object or null
 */
export const getBusById = async (busId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Route,
        as: "route",
        attributes: ["route_name", "start_time", "end_time"],
      },
    ],
    ...options,
  };

  return await findByIdAndSchool(Bus, busId, schoolId, defaultOptions);
};

/**
 * Create a new bus
 * @param {object} busData - Bus data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created bus object
 */
export const createBus = async (busData, schoolId) => {
  return await createWithSchool(Bus, busData, schoolId);
};

/**
 * Update bus by ID
 * @param {string} busId - Bus UUID
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateBus = async (busId, updated_ata, schoolId) => {
  return await updateByIdAndSchool(Bus, updated_ata, busId, schoolId);
};

/**
 * Delete bus (mark as inactive)
 * @param {string} busId - Bus UUID
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteBus = async (busId, schoolId) => {
  return await updateByIdAndSchool(Bus, { is_active: false }, busId, schoolId);
};

/**
 * Get all routes for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of routes
 */
export const getAllRoutes = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Stop,
        as: "stops",
        attributes: ["stop_name", "arrival_time", "departure_time"],
      },
      {
        model: Bus,
        as: "buses",
        attributes: ["bus_number", "capacity"],
      },
    ],
    order: [["route_name", "ASC"]],
    ...options,
  };

  return await findAllBySchool(
    Route,
    schoolId,
    { is_active: true },
    defaultOptions
  );
};

/**
 * Get a single route by ID
 * @param {string} routeId - Route UUID
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Route object or null
 */
export const getRouteById = async (routeId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Stop,
        as: "stops",
        attributes: ["stop_name", "arrival_time", "departure_time"],
      },
      {
        model: Bus,
        as: "buses",
        attributes: ["bus_number", "capacity"],
      },
    ],
    ...options,
  };

  return await findByIdAndSchool(Route, routeId, schoolId, defaultOptions);
};

/**
 * Create a new route
 * @param {object} routeData - Route data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created route object
 */
export const createRoute = async (routeData, schoolId) => {
  return await createWithSchool(Route, routeData, schoolId);
};

/**
 * Update route by ID
 * @param {string} routeId - Route UUID
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateRoute = async (routeId, updated_ata, schoolId) => {
  return await updateByIdAndSchool(Route, updated_ata, routeId, schoolId);
};

/**
 * Delete route (mark as inactive)
 * @param {string} routeId - Route UUID
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteRoute = async (routeId, schoolId) => {
  return await updateByIdAndSchool(
    Route,
    { is_active: false },
    routeId,
    schoolId
  );
};

/**
 * Get all stops for a school
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options (include, order, etc.)
 * @returns {Promise<array>} - Array of stops
 */
export const getAllStops = async (schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Route,
        as: "route",
        attributes: ["route_name"],
      },
    ],
    order: [["stop_name", "ASC"]],
    ...options,
  };

  return await findAllBySchool(
    Stop,
    schoolId,
    { is_active: true },
    defaultOptions
  );
};

/**
 * Get a single stop by ID
 * @param {string} stopId - Stop UUID
 * @param {string} schoolId - School identifier
 * @param {object} options - Additional Sequelize options
 * @returns {Promise<object|null>} - Stop object or null
 */
export const getStopById = async (stopId, schoolId, options = {}) => {
  const defaultOptions = {
    include: [
      {
        model: Route,
        as: "route",
        attributes: ["route_name"],
      },
    ],
    ...options,
  };

  return await findByIdAndSchool(Stop, stopId, schoolId, defaultOptions);
};

/**
 * Create a new stop
 * @param {object} stopData - Stop data
 * @param {string} schoolId - School identifier
 * @returns {Promise<object>} - Created stop object
 */
export const createStop = async (stopData, schoolId) => {
  return await createWithSchool(Stop, stopData, schoolId);
};

/**
 * Update stop by ID
 * @param {string} stopId - Stop UUID
 * @param {object} updated_ata - Data to update
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const updateStop = async (stopId, updated_ata, schoolId) => {
  return await updateByIdAndSchool(Stop, updated_ata, stopId, schoolId);
};

/**
 * Delete stop (mark as inactive)
 * @param {string} stopId - Stop UUID
 * @param {string} schoolId - School identifier
 * @returns {Promise<array>} - Update result [affectedCount]
 */
export const deleteStop = async (stopId, schoolId) => {
  return await updateByIdAndSchool(
    Stop,
    { is_active: false },
    stopId,
    schoolId
  );
};
