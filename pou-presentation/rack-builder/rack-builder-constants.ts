export const branch = 'FACILITY_ID';
export const masterKitId = 'STORAGE_UNIT_ID';

export const searchFields = [
    {
        key: branch,
        title: 'Branch',
        type: 'wildCard',
        config: {
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
            styleclass: 'col-md-2',
            defaultselecteddropDownValue: { FIELD_NAME: branch }
        }
    },
    {
        key: masterKitId,
        title: 'Master Rack Id',
        type: 'wildCard',
        selectEntireRecord: true,
        config: {
            serviceUrl: {
                dropdown: 'WildcardSearch/GetFields?fieldName=STORAGE_UNIT_ID',
                table: 'RackBuilder/SearchResult'
            },
            tableFields: [
                { header: 'Master Rack Id', field: 'STORAGE_UNIT_ID' },
                { header: 'Branch', field: 'FACILITY_ID' },
                { header: 'Inner Width', field: 'UNIT_INNER_WIDTH' },
                { header: 'Length', field: 'UNIT_LENGTH' },
                { header: 'Height', field: 'UNIT_HEIGHT' },
                { header: 'UOM', field: 'UNIT_DIM_UOM' },
                { header: 'Rack Type', field: 'STORAGE_UNIT_TYPE' }
            ],
            label: 'Master Rack Id',
            isMultiSelect: false,
            selectedData: '',
            modelName: masterKitId,
            styleclass: 'col-md-2',
            defaultselecteddropDownValue: { FIELD_NAME: 'STORAGE_UNIT_ID' }
        }
    }
]


export const rackDetailsAPIKey = 'RackBuilder';
export const racksTableAPIKey = 'FacilityStorageUnit';
export const segmentsListAPIKey = 'Segments';

export const shelfTypeKey = 'Shelf';
export const bagTypeKey = 'Bag';
export const hoseReelTypeKey = 'Hose Reel';
export const hoseTypeKey = 'Hose Rack';

export const masterRackDesc = 'STORAGE_UNIT_DESC'
export const outerWidth = 'UNIT_OUTER_WIDTH';
export const innerWidth = 'UNIT_INNER_WIDTH';
export const length = 'UNIT_LENGTH';
export const height = 'UNIT_HEIGHT';
export const UOM = 'UNIT_DIM_UOM';
export const rackTypesKey = 'STORAGE_UNIT_TYPES';
export const rackType = 'STORAGE_UNIT_TYPE';
export const rollers = 'ROLLERS';
export const rollerDDkey = 'ROLLER_FLAG';
export const rollersPerShelf = 'ROLLERS_PER_SHELF';
export const totalPlacements = 'STD_NBR_PLCMNTS';
export const shelfHeight = 'SHELF_HEIGHT';
export const rollerHeight = 'ROLLER_HEIGHT';
export const totalBagHooks = 'STD_NBR_BAG_HOOKS_PER_PLCMNT';
export const totalRackParts = 'STD_NBR_BAG_HOOKS_PER_PLCMNT';


export const rackTypes = [{ field: shelfTypeKey, label: 'Shelf' }, { field: bagTypeKey, label: 'Bag' }, { field: hoseReelTypeKey, label: 'Hose Reel' }, { field: hoseTypeKey, label: 'Hose' }];

export const shelfTypeFields = [
    { field: rackTypesKey, label: 'Rack Type', type: 'dropDown', valueKey: rackType, ddKey: rackType },
    { field: masterKitId, label: 'Master Rack Id', type: 'text' },
    { field: masterRackDesc, label: 'Master Rack Desc', type: 'text' },
    { field: outerWidth, label: 'Outer Width', type: 'number' },
    { field: innerWidth, label: 'Inner Width', type: 'number' },
    { field: length, label: 'Length', type: 'number' },
    { field: height, label: 'Height', type: 'number' },
    { field: UOM, label: 'UOM', type: 'dropDown', valueKey: UOM, ddKey: UOM, fullForm: 'Unit of Measure'},
    { field: rollers, label: 'Rollers', type: 'dropDown', valueKey: rollerDDkey, ddKey: rollerDDkey },
    { field: rollersPerShelf, label: '# Roller Sets Per Shelf', type: 'number' },
    { field: totalPlacements, label: 'Standard # of Shelves', type: 'number' },
    { field: shelfHeight, label: 'Shelf Height', type: 'number' },
    { field: rollerHeight, label: 'Roller Height', type: 'number' }
];
export const bagTypeFields = [
    { field: rackTypesKey, label: 'Rack Type', type: 'dropDown', valueKey: rackType, ddKey: rackType },
    { field: masterKitId, label: 'Master Rack Id', type: 'text' },
    { field: masterRackDesc, label: 'Master Rack Desc', type: 'text' },
    { field: outerWidth, label: 'Outer Width', type: 'number' },
    { field: height, label: 'Height', type: 'number' },
    { field: UOM, label: 'UOM', type: 'dropDown', valueKey: UOM, ddKey: UOM, fullForm: 'Unit of Measure' },
    { field: totalPlacements, label: 'Total Bars per Side', type: 'number' }
];
export const hoseReelTypeFields = [
    { field: rackTypesKey, label: 'Rack Type', type: 'dropDown', valueKey: rackType, ddKey: rackType },
    { field: masterKitId, label: 'Master Rack Id', type: 'text' },
    { field: masterRackDesc, label: 'Master Rack Desc', type: 'text' },
    { field: outerWidth, label: 'Outer Width', type: 'number' },
    { field: innerWidth, label: 'Inner Width', type: 'number' },
    { field: height, label: 'Height', type: 'number' },
    { field: UOM, label: 'UOM', type: 'dropDown', valueKey: UOM, ddKey: UOM, fullForm: 'Unit of Measure' },
    { field: totalPlacements, label: 'Total Bars', type: 'number' }
];
export const hoseTypeFields = [
    { field: rackTypesKey, label: 'Rack Type', type: 'dropDown', valueKey: rackType, ddKey: rackType },
    { field: masterKitId, label: 'Master Rack Id', type: 'text' },
    { field: masterRackDesc, label: 'Master Rack Desc', type: 'text' },
    { field: outerWidth, label: 'Outer Width', type: 'number' },
    { field: height, label: 'Height', type: 'number' },
    { field: UOM, label: 'UOM', type: 'dropDown', valueKey: UOM, ddKey: UOM, fullForm: 'Unit of Measure' },
    { field: totalPlacements, label: 'Total Pegs per Side', type: 'number' }
];

export const fieldsMap = {
    [shelfTypeKey]: shelfTypeFields,
    [bagTypeKey]: bagTypeFields,
    [hoseReelTypeKey]: hoseReelTypeFields,
    [hoseTypeKey]: hoseTypeFields
}

export const nonMandatoryFields = {
    [shelfTypeKey]: [masterRackDesc],
    [bagTypeKey]: [masterRackDesc],
    [hoseReelTypeKey]: [masterRackDesc],
    [hoseTypeKey]: [masterRackDesc],
}

export const dropDowns = {
    [rackTypesKey]: rackType,
    [UOM]: UOM,
    [rollers]: rollerDDkey
}

export const numberFields = [
    outerWidth, innerWidth, length, height, totalBagHooks, totalRackParts, totalPlacements, rollerHeight, rollers, rollersPerShelf, shelfHeight
]

export const keyFieldsToDisable = [masterKitId, rackTypesKey];

export const maxRackHeight = 60;
export const minShelfHeight = 15;

export const uomConversionMap = {
    'IN': 1,
    'CM': 2.5
}


// Assignment constants

export const segments = ['DEF', 'MTM', 'LEON'];
export const branchDescKey = 'FACILITY_DESC';
export const assignmentTableFields = [
    { header: 'Org', field: 'ORG_ID' },
    { header: 'Branch', field: branch },
    { header: 'Description', field: branchDescKey }
];




// rack visualization constants

export const rackFtScale = 84;
export const visualizationUomConversion = 12;
export const paddingOffset = 100;
export const strokeWidth = 1;
export const rackStrokeColor = '#035589';
export const hoseReelItemColor = '#00A006';
export const hoeReelEllipseColor = '#014C0B';
export const bagItemColor = '#00A006';
export const bagItemStrokeColor = '#014C0B';
export const yOffset = 50;
export const xOffset = 50;
export const hoseReelsHeight = 6;
export const hoseShaftheight = 1.5;
export const bottomShelfHeight = 15;
export const bagTypeShaftOuterWidth = 6;
export const bagTypeShaftInnerWidth = 4.5;
export const hoseTypeShaftOuterWidth = 6;
export const hoseTypeShaftInnerWidth = 4.5;
export const wheelHolderColor = '#00A006';
export const wheelColor = 'black';
export const rollerColor = 'black';
export const containerColor = 'green';

//TODO: Minimum distance between placement
export const hoseReelPlacementMinDstnce = 12;
export const shelfMinHeight = 12;
export const bagMinDistance = 12;
export const hoseMinDistance = 12;