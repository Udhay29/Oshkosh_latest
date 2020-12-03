
export const singleRackKey = 'single-rack';
export const rackBuilderKey = 'rack-builder';

export const pouPresentationTabsList = [
  {
    displayName: 'Rack Builder',
    value: rackBuilderKey,
    class: rackBuilderKey
  },
  {
    displayName: 'Single Rack',
    value: singleRackKey,
    class: singleRackKey
  }
];

export const orgId = 'ORG_ID';
export const itemId = 'ITEM_ID';
export const itemDesc = 'ITEM_DESC';
export const workCenter = 'TGT_WORK_CENTER_ID';
export const orientation = 'CONTAINER_ORIENTATION';
export const KSL = 'KIT_SPACE_LENGTH';
export const KSW = 'KIT_SPACE_WIDTH';
export const KSH = 'KIT_SPACE_HEIGHT';
export const kitId = 'MASTER_KIT_ID';
export const kitType = 'KIT_TYPE';
export const BPHQty = 'BAGS_PER_HOOK_QUANTITY';
export const bagQty = 'BAG_QUANTITY';
export const containerCode = 'POU_CONTAINER';
export const lineSideQueue = 'LINE_SIDE_QUEUE_QTY';
export const MFP = 'MTRL_FLOW_PLAN_ID';
export const PID = 'PID';
export const taskId = 'TASK_ID';
export const plannedInWC = 'PLANNED_IN_WC';
export const stockingType = 'STOCKING_TYPE';
export const DNP = 'DO_NOT_PLAN';
export const HSH = 'HANDSTACK_SPACE_HEIGHT';
export const HSW = 'HANDSTACK_SPACE_WIDTH';
export const HSQty = 'HANDSTACK_SPACE_QUANTITY';
export const HSL = 'HANDSTACK_SPACE_LENGTH';
export const pickFacings = 'PICK_FACING_QNTY';
export const presentation = 'PRESENTATION_TYPE';
export const itemPlanStatus = 'ItemPlanStatus';
export const expireDate = 'EXPIRE_DATE';
export const effectiveDate = 'EFFECTIVE_DATE';
export const itemPlanId = 'ITEM_PLAN_ID';
export const branch = 'FACILITY_ID';
export const executeCtr = 'Execute Container';
export const Archive = 'Archive';
export const workCenterDDKey = 'WORK_CENTER_ID';
export const workCenterId = 'WORK_CENTER_ID';
export const containerQty = 'CONTAINER_QTY';
export const HRPQ = 'HDS_REORDER_POINT_QTY';
export const HPQ = 'HDS_REORDER_QTY';

export const wcRackId = 'WC_STORAGE_UNIT_ID';
// export const wcRackId = 'STORAGE_UNIT_ID';
export const storageUnitId = 'STORAGE_UNIT_ID';
export const workCenterRackDesc = 'STORAGE_UNIT_DESC';
export const workCenterRackType = 'STORAGE_UNIT_TYPE';

export const innerWidth = 'UNIT_INNER_WIDTH';
export const outerWidth = 'UNIT_OUTER_WIDTH';
export const height = 'UNIT_HEIGHT';
export const length = 'UNIT_LENGTH';

export const fromDate = 'EFFECTIVE_FROM_DATE';
export const toDate = 'EFFECTIVE_TO_DATE';

export const presentationTypeKey = 'PRESENTATION_TYPE';
export const itemPlanStatusKey = 'ITEM_PLAN_STATUS';


export const wildCardLookUpConfig = [
  {
    serviceUrl: {
      dropdown: 'WildcardSearch/GetFields?fieldName=FACILITY_ID',
      table: 'WildcardSearch/GetDropdownValuesWarehouse'
    },
    tableFields: [
      { header: 'ID', field: 'FACILITY_ID' },
      { header: 'Description', field: 'FACILITY_DESC' }
    ],
    label: 'Branch',
    isMultiSelect: false,
    selectedData: '',
    modelName: 'FACILITY_ID',
    styleclass: 'col-md-6',
    defaultselecteddropDownValue: { FIELD_NAME: 'FACILITY_ID' }
  },
  {
    serviceUrl: {
      dropdown: 'WildcardSearch/GetFields?fieldName=WORK_CENTER_ID',
      table: 'WildcardSearch/GetDropdownValuesWorkCenter'
    },
    tableFields: [
      { header: 'ID', field: workCenterDDKey },
      { header: 'Description', field: 'WORK_CENTER_DESC' }
    ],
    label: 'Work Center',
    isMultiSelect: false,
    selectedData: '',
    options: [],
    modelName: workCenterDDKey,
    styleclass: 'col-md-6',
    dependentData: '',
    defaultselecteddropDownValue: { FIELD_NAME: 'WORK_CENTER_ID' }
  }
];

export const singleRackTableFields = [
  {
    field: itemId,
    type: 'text',
    order: 'sort',
    header: 'Item Number',
    sortField: itemId
  },
  { field: itemDesc, type: 'text', order: 'unsort', header: 'Description' },
  // {field:workCenter,order:"unsort",type:"text",header:"Work Center"},
  {
    field: itemPlanId,
    type: 'link',
    header: 'Item Plan ID',
    order: 'sort'
  },
  {
    field: presentation,
    type: 'dropDown',
    header: 'Presentation Type',
    ddField: presentationTypeKey,
    order: 'sort'
  },
  {
    field: containerCode,
    type: 'text',
    header: 'POU Container',
    order: 'sort',
    sortField: containerCode
  },
  {
    field: pickFacings,
    type: 'number',
    order: 'sort',
    header: 'Pick Facings',
    sortField: pickFacings
  },
  { field: orientation, type: 'text', header: 'Orientation', order: 'sort' },
  { field: wcRackId, type: 'text', header: 'WC Rack ID', order: 'sort' },
  { field: MFP, type: 'text', header: 'MFP', order: 'sort', fullForm: 'Material Flow Plan' },
  { field: PID, type: 'decimal', header: 'PID', order: 'sort', sortField: PID, fullForm: 'Peak Interval Demand' },
  {
    field: taskId,
    type: 'text',
    header: 'Task ID',
    order: 'sort',
    sortField: taskId
  }
];

export const workCenterRackTableField = [
  {
    field: wcRackId,
    type: 'text',
    order: 'sort',
    header: 'Work Center Rack ID'
  },
  {
    field: workCenterRackDesc,
    type: 'text',
    order: 'sort',
    header: 'Standard Rack Desc'
  },
  {
    field: workCenterRackType,
    type: 'text',
    order: 'sort',
    header: 'Rack Type'
  }
];

export const workCenterMasterRackTableField = [
  {
    field: wcRackId,
    type: 'text',
    header: 'Work Center Rack ID'
  },
  {
    field: storageUnitId,
    type: 'text',
    header: 'Master Rack ID'
  },
  {
    field: workCenterRackDesc,
    type: 'text',
    header: 'Standard Rack Desc'
  },
  {
    field: workCenterRackType,
    type: 'text',
    header: 'Rack Type'
  },
  {
    field: outerWidth,
    type: 'text',
    header: 'Outer Width'
  },
  {
    field: innerWidth,
    type: 'text',
    header: 'Inner Width'
  },
  {
    field: length,
    type: 'text',
    header: 'Length'
  },
  {
    field: height,
    type: 'text',
    header: 'Height'
  }
];

export const frozenColumns = [
  {
    field: itemId,
    type: 'text',
    order: 'sort',
    header: 'Part Number',
    sortField: itemId
  }, {
    field: itemPlanId,
    type: 'link',
    header: 'Item Plan Id',
    order: 'unsort'
  },
]

export const checkboxValues = {
  [DNP]: ['Y', 'N']
};

export const typeDropDowns = {
  [itemPlanStatus]: { field: itemPlanStatus, key: itemPlanStatusKey },
  [presentation]: { field: presentation, key: presentationTypeKey }
};

export const bulkSelectValue = 'Bulk';
export const binSelectValue = 'Bin';
const handStackSelectValue = 'Hand Stack';
const bagSelectValue = 'Bag';
const kitSelectValue = 'Kit';
const callSelectValue = 'Call';

export const itemsGridFilters = [itemId, itemPlanId, presentation, containerCode, pickFacings, orientation, wcRackId, MFP, PID, taskId];

export const sortFields = {
  [itemId]: 0,
  [itemPlanId]: 0,
  [presentation]: 0,
  [orientation]: 0,
  [MFP]: 0,
  [wcRackId]: 0,
  [pickFacings]: 0,
  [containerCode]: 0,
  [PID]: 0,
  [taskId]: 0
};

export const saveSuccessMessage = 'Details saved successfully';
