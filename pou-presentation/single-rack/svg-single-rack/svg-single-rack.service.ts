import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { SharedService } from "./../../../../shared/services/share.service";
import * as constants from './rack-builder-constants';
import { RackBuilderService } from '../../rack-builder/rack-builder.service';
import { SingleRackService } from '../single-rack.service';

@Injectable({
  providedIn: 'root'
})
export class SvgSingleRackService {

  rackValues: any;
  workCenterRack: any = {};
  rackType: string = '';
  lineGenerator: any;
  rackCtr: any;
  uomConversion = 12;
  rackHeight = constants.height;
  visualizationCtrDims = {
    height: 530,
    width: 700
  }
  handStackHeight: any = 'auto';

  constructor(public rackBuilderService: RackBuilderService,
    public sharedService: SharedService,
    private singleRackService: SingleRackService) { }

  generateSvg() {
    const data = this.sharedService.getSingelRacksvg();
    console.log(data);
    if (data !== undefined) {
      this.rackValues = data.WorkCenterRack.MasterRack;
      if (this.rackValues[constants.rackTypesKey] === 'Shelf' || this.rackValues[constants.rackTypesKey] === 'Hose Reel') {
        this.singleRackService.addWidthKey(data.WorkCenterRack.WorkCenterRackItems);
      }
      if (this.rackValues[constants.rackTypesKey] === 'Shelf') {
        this.singleRackService.addWidthKeyHandStack(data.WorkCenterRack['LEFT_ITEMS']);
        this.singleRackService.addWidthKeyHandStack(data.WorkCenterRack['RIGHT_ITEMS']);
      }
      this.workCenterRack['workCenterRackItems'] = data.WorkCenterRack.WorkCenterRackItems;
      this.workCenterRack['numberOfShelves'] = data.WorkCenterRack[constants.numberOfShelves];
      this.workCenterRack['numberOfBagHooks'] = data.WorkCenterRack[constants.numberOfBagHooks];
      this.workCenterRack['leftHookItems'] = data.WorkCenterRack[constants.leftHookItems];
      this.workCenterRack['rightHookItems'] = data.WorkCenterRack[constants.rightHookItems];
      this.rackType = this.rackValues[constants.rackTypesKey];
      const currentrackValue = this.rackValues;
      this.clearRack();
      if (currentrackValue && Object.keys(currentrackValue).length > 0) {
        this.handStackHeight = ((this.rackValues[constants.height]) * (constants.rackFtScale / this.uomConversion));
        this.rackGenerator();
      }
    }
  }

  getRackValues() {
    return this.rackValues;
  }

  // ngOnChanges(changes) {
  //   if (changes.rackValues) {
  //     this.rackType = this.rackValues[constants.rackTypesKey];
  //     const currentrackValue = changes.rackValues.currentValue;
  //     this.clearRack();
  //     if (currentrackValue && Object.keys(currentrackValue).length > 0) {
  //       this.handStackHeight = ((this.rackValues[constants.height]-14) * (constants.rackFtScale / this.uomConversion));
  //       console.log(this.rackValues);
  //       this.rackGenerator();
  //     }
  //   }
  // }

  // getClassState = () => {
  //   if (Object.keys(this.rackValues).length > 0 && this.rackValues[constants.height] > 0) {
  //     return false;
  //   }
  //   return true;
  // }

  clearRack = () => {
    const rackCtr = document.getElementsByClassName('rack-ctr');
    if (rackCtr.length > 0 && rackCtr[0].firstChild) {
      rackCtr[0].removeChild(rackCtr[0].firstChild);
    }
  }

  rackGenerator = () => {
    this.visualizationCtrDims = {
      'height': (this.rackValues[constants.height] * (constants.rackFtScale / 12) + constants.yOffset + 50 + (this.rackType === constants.hoseReelTypeKey ? 50 : 0)),
      'width': (this.rackValues[constants.outerWidth] * (constants.rackFtScale / 12) + constants.xOffset + 50)
    }
    const uomConversion = 12;

    let handStackWidth = (30 * (constants.rackFtScale / 12) + constants.xOffset + 50);


    this.rackCtr = d3.select('.rack-ctr')
      .append('svg')
      .attr('id', 'rack-svg')
      .attr('width', this.visualizationCtrDims.width)
      .attr('height', this.visualizationCtrDims.height);

    this.lineGenerator = d3.line()
      .x(pt => this.getXCord(pt.x))
      .y(pt => this.getYCord(pt.y))
      .defined(pt => pt !== null);

    const placementCoOrds = this.buildPlacementCoOrdinates();

    const rackCoOrdinates = [
      ...this.buildRack(),
      ...placementCoOrds.placements
    ];

    this.rackCtr.append('path')
      .attr('d', this.lineGenerator(rackCoOrdinates))
      .attr('stroke-width', 4)
      .attr('stroke', constants.rackStrokeColor)
      .attr('fill', constants.rackStrokeColor);

    this.buildItems(placementCoOrds);

  }

  buildRack = () => {
    let CoOrds = [];
    switch (this.rackType) {
      case constants.shelfTypeKey:
        CoOrds = this.buildShelfTypeRackCoOrds();
        break;

      case constants.hoseReelTypeKey:
        CoOrds = this.buildHoseReelTypeRack();
        break;

      case constants.bagTypeKey:
        CoOrds = this.buildBagTypeRack();
        break;

      case constants.hoseTypeKey:
        CoOrds = this.buildHoseTypeRack();
        break;
    }

    return CoOrds;
  }

  buildPlacementCoOrdinates = () => {
    let CoOrds = { placements: [], itemCoOrds: [] };

    switch (this.rackType) {
      case constants.shelfTypeKey:
        CoOrds = this.shelfCoOrdinates();
        break;

      case constants.hoseReelTypeKey:
        CoOrds = this.buildHoseReelsPlacements();
        break;

      case constants.bagTypeKey:
        CoOrds = this.buildBagPlacements();
        break;

      case constants.hoseTypeKey:
        CoOrds = this.buildHosePlacements();
        break;
    }
    return CoOrds;
  }


  buildItems = (placementCoOrds) => {
    const itemCoOrds = placementCoOrds.itemCoOrds;
    const containerCoOrds = placementCoOrds.containerCoOrds;
    switch (this.rackType) {
      case constants.shelfTypeKey:
        this.drawRollers(itemCoOrds);
        this.drawUniformContainers(containerCoOrds);
        break;

      case constants.hoseReelTypeKey:
        this.drawHoseReels(itemCoOrds);
        break;

      case constants.bagTypeKey:
        this.drawBags(itemCoOrds);
        break;

      case constants.hoseTypeKey:
        this.drawHoses(itemCoOrds);
        break;
    }
  }


  drawWheels = (height, rackOuterWidth, rackWidth) => {

    const uomConversion = 12;
    const wheelHolderHeight = 1;
    const wheelGuardHeight = 3.5;
    const wheelHeight = 5;
    const wheelWidth = 2;
    const wheelOverFlowOffset = 0.5;
    // applying wheel offset if each barWidth is less than or equal to 1"
    let wheelOffsetApplicable = false;
    const actualRackWidth = rackWidth;

    //TODO: Wheel width should be lesser than rackwidth
    /* if (wheelWidth > rackWidth) {
      this.rackBuilderService.displayMessage('error', 'Bar is too thin. Cannot draw wheels');
      return;
    } */

    if (rackWidth < 1) {
      wheelOffsetApplicable = true;
      rackWidth = rackWidth + (wheelOverFlowOffset * 2);
    }


    [{ x: wheelOffsetApplicable ? (-1 * wheelOverFlowOffset) : 0, y: height }, { x: rackOuterWidth - (actualRackWidth + (wheelOffsetApplicable ? wheelOverFlowOffset : 0)), y: height }].forEach(pt => {
      this.rackCtr.append('rect')
        .attr('x', this.getXCord(pt.x))
        .attr('y', this.getYCord(pt.y))
        .attr('height', wheelHolderHeight * constants.rackFtScale / this.uomConversion)
        .attr('width', rackWidth * constants.rackFtScale / this.uomConversion)
        .attr('stroke-width', 4)
        .attr('stroke', constants.wheelHolderColor)
        .attr('fill', constants.wheelHolderColor);

      const wheelGuardCoOrds = [
        { x: pt.x, y: pt.y },
        { x: pt.x, y: pt.y + wheelGuardHeight },
        null,
        { x: pt.x + rackWidth, y: pt.y },
        { x: pt.x + rackWidth, y: pt.y + wheelGuardHeight },
        null
      ];
      this.rackCtr.append('path')
        .attr('d', this.lineGenerator(wheelGuardCoOrds))
        .attr('stroke-width', 4)
        .attr('stroke', constants.wheelHolderColor)
        .attr('fill', constants.wheelHolderColor);

      const path = d3.path();
      path.moveTo(this.getXCord(pt.x + 0.5), this.getYCord(pt.y + wheelHolderHeight + 1.5));
      path.lineTo(this.getXCord(pt.x + 0.5), this.getYCord(pt.y + wheelHolderHeight + wheelHeight - 1));
      const radius = (this.getXCord(pt.x + rackWidth / 2) - this.getXCord(pt.x + 0.5));
      path.arc(this.getXCord(pt.x + (rackWidth / 2)), this.getYCord(pt.y + wheelHolderHeight + wheelHeight - 1), radius, Math.PI, 0, true);
      path.lineTo(this.getXCord(pt.x + rackWidth - 0.5), this.getYCord(pt.y + wheelHolderHeight + 1.5));
      path.arc(this.getXCord(pt.x + (rackWidth) / 2), this.getYCord(pt.y + wheelHolderHeight + 1.5), radius, 0, Math.PI, true);

      this.rackCtr.append('path')
        .attr('d', path.toString())
        .attr('stroke-width', 2)
        .attr('stroke', constants.wheelColor)
        .attr('fill', constants.wheelColor);

    });
  }

  getXCord = pt => (pt * constants.rackFtScale / this.uomConversion) + constants.xOffset;
  getYCord = pt => (pt * constants.rackFtScale / this.uomConversion) + constants.yOffset;


  // Shelf type functions

  buildShelfTypeRackCoOrds = () => {
    const rackWidth = (this.rackValues[constants.outerWidth] - this.rackValues[constants.innerWidth]) / 2;
    this.drawWheels(this.rackValues[constants.height], this.rackValues[constants.outerWidth], rackWidth);
    return [
      { x: 0, y: 0 },
      { x: 0, y: this.rackValues[constants.height] },
      { x: rackWidth, y: this.rackValues[constants.height] },
      { x: rackWidth, y: 0 },
      null,
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: 0 },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: this.rackValues[constants.height] },
      { x: this.rackValues[constants.outerWidth], y: this.rackValues[constants.height] },
      { x: this.rackValues[constants.outerWidth], y: 0 }
    ];
  }
  getContainersPerShelf(shelf: any) {
    return (shelf !== undefined) ? shelf[constants.rackItems].length : 0;
  }
  shelfCoOrdinates = () => {
    let shelfCoOrds = [];
    let itemCoOrds = [];
    let containerCoOrds = [];
    const rollerHeight = (this.rackValues[constants.rollers]) ? this.rackValues[constants.rollerHeight] : 0;
    //TODO: convert the below acc to UOM
    const individualShelfHeight = (this.rackValues[constants.height] - constants.bottomShelfHeight) / (this.workCenterRack.numberOfShelves);
    const rackWidth = (this.rackValues[constants.outerWidth] - this.rackValues[constants.innerWidth]) / 2;

    for (let i = 1, previousShelfHeight = constants.bottomShelfHeight; i <= this.workCenterRack.numberOfShelves; i++) {
      const coOrds = [
        null,
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] },
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] }
      ];
      shelfCoOrds = [...shelfCoOrds, ...coOrds];

      itemCoOrds = this.rackValues[constants.rollers] ? [...itemCoOrds, { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] }] : itemCoOrds;

      const rackItems = (this.workCenterRack.workCenterRackItems !== undefined) ? this.workCenterRack.workCenterRackItems[i - 1][constants.rackItems] : [];
      containerCoOrds = (this.getContainersPerShelf(this.workCenterRack.workCenterRackItems[i - 1]) > 0) ? [...containerCoOrds, { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] - rollerHeight, containersPerShelf: this.getContainersPerShelf(this.workCenterRack.workCenterRackItems[i - 1]), rackItems: rackItems }] : containerCoOrds;

      previousShelfHeight = previousShelfHeight + individualShelfHeight;
    }
    return { placements: shelfCoOrds, itemCoOrds, containerCoOrds };
  }



  drawRollers = placementCoOrds => {
    //this.rackValues[constants.innerWidth], containersPerShelf
    // settings 1 inches as a handstack space 1 each on first and last roller
    const rollerXOffset = 0.5;
    // this is just to make sure that roller and shelf dont overlap, (for representation purposes only)
    const rollerYOffset = 0.5;
    // sy=ubtracting the rollerXOffset from roller width

    const rollerWidth = (this.rackValues[constants.innerWidth] - ((this.rackValues[constants.rollersPerShelf] + 1) * rollerXOffset)) / this.rackValues[constants.rollersPerShelf];
    const rollerHeight = this.rackValues[constants.rollerHeight];
    placementCoOrds.forEach(pt => {
      for (let i = 0; i < this.rackValues[constants.rollersPerShelf]; i++) {
        const path = d3.path();
        // rolleWidth/2 to accomodate the arc 
        path.moveTo(this.getXCord(pt.x + (rollerXOffset * (i + 1)) + (rollerHeight / 2) + (i * rollerWidth)), this.getYCord(pt.y - rollerYOffset));
        path.lineTo(this.getXCord(pt.x + (rollerXOffset * (i + 1)) + rollerWidth - (rollerHeight / 2) + (i * rollerWidth)), this.getYCord(pt.y - rollerYOffset));
        const arcRadius = (rollerHeight / 2) * (constants.rackFtScale / this.uomConversion);
        path.arc(this.getXCord(pt.x + (rollerXOffset * (i + 1)) + rollerWidth - (rollerHeight / 2) + (i * rollerWidth)), this.getYCord(pt.y - rollerYOffset - (rollerHeight / 2)), arcRadius, Math.PI / 2, Math.PI * -1 / 2, true);
        path.lineTo(this.getXCord(pt.x + (rollerXOffset * (i + 1)) + rollerWidth - (rollerHeight / 2) + (i * rollerWidth)), this.getYCord(pt.y - rollerYOffset - rollerHeight));
        path.arc(this.getXCord(pt.x + (rollerXOffset * (i + 1)) + (rollerHeight / 2) + (i * rollerWidth)), this.getYCord(pt.y - rollerYOffset - (rollerHeight / 2)), arcRadius, Math.PI * -1 / 2, Math.PI / 2, true);

        this.rackCtr.append('path')
          .attr('d', path.toString())
          .attr('stroke-width', 1)
          .attr('stroke', constants.rollerColor)
          .attr('fill', constants.rollerColor);
      }
    });

  }

  drawUniformContainers = placementCoOrds => {
    // settings 1 inches as a handstack space 1 each on first and last roller
    const leftHandStackSpaceInRack = 0.5;
    const rightHandStackSpaceInRack = 0.5;
    const spaceBWCtrs = 0.5;

    // this is just to make sure that roller and shelf dont overlap, (for representation purposes only)
    const rollerYOffset = 0.5;
    // sy=ubtracting the rollerXOffset from roller width
    const rollerHeight = this.rackValues[constants.rollerHeight];


    placementCoOrds.forEach(pt => {
      let xContainerWidth = 0;
      // Adding handstackspace on either side and the space between ctrs and deducting the (value/ totalCtrs) from each ctr width
      const totalSpace = leftHandStackSpaceInRack + rightHandStackSpaceInRack + ((pt.containersPerShelf - 1) * spaceBWCtrs);
      const widthToDeduct = (pt.containersPerShelf > 1) ? totalSpace / (pt.containersPerShelf - 1) : 0.5;

      for (let i = 0; i < pt.containersPerShelf; i++) {
        const containerWidth = (pt.rackItems.length > 0 && pt.rackItems[i].width !== undefined) ? pt.rackItems[i].width - widthToDeduct : 0;
        const prevContainerWidth = (pt.rackItems.length > 0 && i > 0 && pt.rackItems[i].width !== undefined) ? pt.rackItems[i - 1].width : 0;
        const containerHeight = (pt.rackItems.length > 0 && pt.rackItems[i].height !== undefined) ? pt.rackItems[i].height : 0;
        const path = d3.path();

        xContainerWidth += (i > 0) ? prevContainerWidth : 0;
        this.rackCtr.append('rect')
          .attr('x', this.getXCord(pt.x + leftHandStackSpaceInRack + xContainerWidth))
          .attr('y', this.getYCord(pt.y - rollerHeight - containerHeight))
          .attr('height', containerHeight * constants.rackFtScale / this.uomConversion)
          .attr('width', containerWidth * constants.rackFtScale / this.uomConversion)
          .attr('stroke-width', 1)
          .attr('stroke', this.getCtrColor(pt.rackItems[i][constants.conatainerTypeKey], 'stroke'))
          .attr('fill', this.getCtrColor(pt.rackItems[i][constants.conatainerTypeKey], 'fill'))
          .append("svg:title")
          .text(function (d, idx) { return pt.rackItems[i]['ITEM_ID'] });

        this.rackCtr.append("text")
          .attr("x", this.getXCord(pt.x + leftHandStackSpaceInRack + xContainerWidth))
          .attr('y', this.getYCord(pt.y - rollerHeight - containerHeight / 2))
          .attr('width', containerWidth * constants.rackFtScale / this.uomConversion)
          .attr("fill", this.getCtrColor(pt.rackItems[i][constants.conatainerTypeKey], 'text'))
          .attr("font-family", "sans-serif")
          .attr("font-weight", "700")
          .attr("font-size", "12px")
          .text(pt.rackItems[i]['ITEM_ID'])
          .call(wrap)
          .append("svg:title")
          .text(function (d, idx) { return pt.rackItems[i]['ITEM_ID'] });
      }
    });

  }




  // Hose Reel type functions

  buildHoseReelTypeRack = () => {

    const rackWidth = (this.rackValues[constants.outerWidth] - this.rackValues[constants.innerWidth]) / 2;
    this.drawWheels(this.rackValues[constants.height] + (constants.hoseReelsHeight / 2), this.rackValues[constants.outerWidth], rackWidth);
    return [
      { x: 0, y: constants.hoseReelsHeight / 2 },
      { x: 0, y: this.rackValues[constants.height] + (constants.hoseReelsHeight / 2) },
      { x: rackWidth, y: this.rackValues[constants.height] + (constants.hoseReelsHeight / 2) },
      { x: rackWidth, y: 0 + (constants.hoseReelsHeight / 2) },
      null,
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: 0 + (constants.hoseReelsHeight / 2) },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: this.rackValues[constants.height] + (constants.hoseReelsHeight / 2) },
      { x: this.rackValues[constants.outerWidth], y: this.rackValues[constants.height] + (constants.hoseReelsHeight / 2) },
      { x: this.rackValues[constants.outerWidth], y: 0 + (constants.hoseReelsHeight / 2) }
    ];
  }

  buildHoseReelsPlacements = () => {

    let shelfCoOrds = [];
    let itemCoOrds = [];
    //TODO: convert the below acc to UOM
    const individualShelfHeight = (this.rackValues[constants.height]) / (this.workCenterRack.numberOfShelves);
    const rackWidth = (this.rackValues[constants.outerWidth] - this.rackValues[constants.innerWidth]) / 2;

    for (let i = 1, previousShelfHeight = individualShelfHeight; i <= this.workCenterRack.numberOfShelves; i++) {
      const coOrds = [
        null,
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + constants.hoseShaftheight + (constants.hoseReelsHeight / 2) },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + constants.hoseShaftheight + (constants.hoseReelsHeight / 2) },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + (constants.hoseReelsHeight / 2) + 0.3 },
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + (constants.hoseReelsHeight / 2) + 0.3 }
      ];
      previousShelfHeight = previousShelfHeight + individualShelfHeight;
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      const rackItems = (this.workCenterRack.workCenterRackItems !== undefined) ? this.workCenterRack.workCenterRackItems[i - 1][constants.rackItems] : [];
      itemCoOrds = (this.getContainersPerShelf(this.workCenterRack.workCenterRackItems[i - 1]) > 0) ? [...itemCoOrds, this.buildHoseReels(coOrds, rackItems, this.getContainersPerShelf(this.workCenterRack.workCenterRackItems[i - 1]))] : [...itemCoOrds];
    }
    return { placements: shelfCoOrds, itemCoOrds };

  }

  buildHoseReels = (placement, rackItems, reelsPerShelf) => {
    //TODO: convert the below acc to UOM
    const widthOffset = 8;
    const hoseReelWidth = this.rackValues[constants.innerWidth] - widthOffset;
    return {
      x: placement[1].x,
      y: placement[4].y - (constants.hoseReelsHeight / 2),
      width: hoseReelWidth,
      height: constants.hoseReelsHeight,
      rackItems: rackItems,
      reelsPerShelf: reelsPerShelf
    };
  }

  drawHoseReels = coOrds => {
    const uomConversion = 12;
    const spaceBWCtrs = 1;
    coOrds.forEach(pt => {
      let xReelWidth = 0;
      let rightXellipse = 0;
      const totalSpace = ((pt.reelsPerShelf) * (spaceBWCtrs * 2));
      const widthToDeduct = (pt.reelsPerShelf > 1) ? this.rackValues[constants.innerWidth] / (pt.reelsPerShelf) : 0.5;

      for (let i = 0; i < pt.reelsPerShelf; i++) {
        const reelWidth = (pt.rackItems.length > 0 && pt.rackItems[i].width !== undefined) ? pt.rackItems[i].width - (spaceBWCtrs * 2) - 1 : 0;
        const prevReelWidth = (pt.rackItems.length > 0 && i > 0 && pt.rackItems[i].width !== undefined) ? pt.rackItems[i - 1].width : 0;
        const reelHeight = (pt.rackItems.length > 0 && pt.rackItems[i].height !== undefined) ? pt.rackItems[i].height : 0;
        // const path = d3.path();

        xReelWidth += (i > 0) ? prevReelWidth : (spaceBWCtrs * 2);

        rightXellipse = (i > 0) ? (xReelWidth + reelWidth) : reelWidth + (spaceBWCtrs * 2);

        this.rackCtr.append('rect')
          .attr('x', this.getXCord(pt.x + xReelWidth))
          .attr('y', this.getYCord(pt.y))
          .attr('height', pt.height * constants.rackFtScale / this.uomConversion)
          .attr('width', reelWidth * constants.rackFtScale / this.uomConversion)
          .attr('stroke-width', 4)
          .attr('stroke', constants.hoseReelItemColor)
          .attr('fill', constants.hoseReelItemColor)
          .append("svg:title")
          .text(function (d, idx) { return pt.rackItems[i]['ITEM_ID'] });

        const ellipseCoOrds = [
          { x: pt.x + xReelWidth, y: pt.y + pt.height / 2, rx: 5, ry: pt.height },
          { x: pt.x + rightXellipse, y: pt.y + pt.height / 2, rx: 5, ry: pt.height },
        ];


        ellipseCoOrds.forEach(ellipsePt => {
          this.rackCtr.append('ellipse')
            .attr('cx', this.getXCord(ellipsePt.x))
            .attr('cy', this.getYCord(ellipsePt.y))
            .attr('rx', ellipsePt.rx)
            .attr('ry', (ellipsePt.ry * constants.rackFtScale / this.uomConversion))
            .attr('stroke-width', 2)
            .attr('stroke', constants.hoeReelEllipseColor)
            .attr('fill', constants.hoeReelEllipseColor);
        })
      }
    });
  };


  // Bag type functions

  buildBagTypeRack = () => {
    const minHeightOffset = constants.bottomShelfHeight;
    const rackWidth = constants.bagTypeShaftOuterWidth - constants.bagTypeShaftInnerWidth;
    const shaftXOffset = (this.rackValues[constants.outerWidth] - constants.bagTypeShaftOuterWidth) / 2;
    this.drawWheels(this.rackValues[constants.height], this.rackValues[constants.outerWidth], rackWidth);
    return [
      { x: 0, y: this.rackValues[constants.height] },
      { x: 0, y: this.rackValues[constants.height] - minHeightOffset },
      { x: this.rackValues[constants.outerWidth], y: this.rackValues[constants.height] - minHeightOffset },
      { x: this.rackValues[constants.outerWidth], y: this.rackValues[constants.height] },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: this.rackValues[constants.height] },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: this.rackValues[constants.height] - minHeightOffset + rackWidth },
      { x: rackWidth, y: this.rackValues[constants.height] - minHeightOffset + rackWidth },
      { x: rackWidth, y: this.rackValues[constants.height] },
      null,
      { x: rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) - (rackWidth / 2)) },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) - (rackWidth / 2)) },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) + (rackWidth / 2)) },
      { x: rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) + (rackWidth / 2)) },
      null,
      { x: shaftXOffset, y: this.rackValues[constants.height] - minHeightOffset },
      { x: shaftXOffset, y: 0 },
      { x: shaftXOffset + constants.bagTypeShaftOuterWidth, y: 0 },
      { x: shaftXOffset + constants.bagTypeShaftOuterWidth, y: this.rackValues[constants.height] - minHeightOffset },
      { x: shaftXOffset + constants.bagTypeShaftInnerWidth, y: this.rackValues[constants.height] - minHeightOffset },
      { x: shaftXOffset + constants.bagTypeShaftInnerWidth, y: rackWidth },
      { x: shaftXOffset + rackWidth, y: rackWidth },
      { x: shaftXOffset + rackWidth, y: this.rackValues[constants.height] - minHeightOffset }

    ]
  }

  buildBagPlacements = () => {
    const minHeightOffset = constants.bottomShelfHeight;
    const individualPlacmentHeight = (this.rackValues[constants.height] - minHeightOffset) / (this.workCenterRack.numberOfBagHooks);
    const rackWidth = constants.bagTypeShaftOuterWidth - constants.bagTypeShaftInnerWidth;
    const shaftXOffset = (this.rackValues[constants.outerWidth] - constants.bagTypeShaftOuterWidth) / 2;
    const placementHeightOffset = this.rackValues[constants.height] - minHeightOffset;
    let shelfCoOrds = [];
    let itemCoOrds = [];

    for (let i = 1, previousShelfHeight = individualPlacmentHeight; i <= this.workCenterRack.numberOfBagHooks; i++) {
      const coOrds = [
        null,
        ...this.bagPlacementCoOrdGenerator(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left'),
        null,
        ...this.bagPlacementCoOrdGenerator(shaftXOffset + constants.bagTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right')
      ];
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      itemCoOrds = [
        ...itemCoOrds,
        (this.workCenterRack.leftHookItems[i - 1].RackItems.length > 0) ? this.buildBagCoOrds(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left', i) : null,
        (this.workCenterRack.rightHookItems[i - 1].RackItems.length > 0) ? this.buildBagCoOrds(shaftXOffset + constants.bagTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right', i) : null
      ];
      previousShelfHeight = previousShelfHeight + individualPlacmentHeight;
    }
    return { placements: shelfCoOrds, itemCoOrds: itemCoOrds };
  }

  bagPlacementCoOrdGenerator = (x, y, orientation) => {
    const rackOrientationCoEff = orientation === 'Left' ? -1 : 1;
    return [
      /* {x, y},
      {x: x + (1 * rackOrientationCoEff), y},
      {x: x + (2 * rackOrientationCoEff), y: y + 1},
      {x: x + (3 * rackOrientationCoEff), y: y + 1},
      {x: x + (4 * rackOrientationCoEff), y: y },
      {x: x + (4.5 * rackOrientationCoEff), y: y + 1 },
      {x: x + (3.5 * rackOrientationCoEff), y: y + 2 },
      {x: x + (1.5 * rackOrientationCoEff), y: y + 2},
      {x: x + (1 * rackOrientationCoEff), y: y + 1 },
      {x: x , y: y + 1 } */

      { x, y },
      { x: x + (1 * rackOrientationCoEff), y },
      { x: x + (2 * rackOrientationCoEff), y: y + 1 },
      { x: x + (3 * rackOrientationCoEff), y: y + 1 },
      { x: x + (4.25 * rackOrientationCoEff), y: y + 0.25 },
      { x: x + (4.5 * rackOrientationCoEff), y: y + 0.5 },
      { x: x + (3 * rackOrientationCoEff), y: y + 1.5 },
      { x: x + (2 * rackOrientationCoEff), y: y + 1.5 },
      { x: x + (1 * rackOrientationCoEff), y: y + 0.5 },
      { x: x, y: y + 0.5 }
    ];
  }

  buildBagCoOrds = (x, y, orientation, index) => {
    const rackOrientationCoEff = orientation === 'Left' ? -1 : 1;
    const xBeginPtOffset = orientation === 'Left' ? 0.5 : 0;

    const orientationConst = (orientation === 'Left') ? 'leftHookItems' : 'rightHookItems';

    const rackItems = (this.workCenterRack[orientationConst] !== undefined) ? this.workCenterRack[orientationConst][index - 1][constants.rackItems] : [];

    return {
      x: x + ((2.25 + xBeginPtOffset) * rackOrientationCoEff),
      y: y + 1,
      rackItems: rackItems
    };
  }

  drawBags = bagCoOrds => {
    const bagHookWidth = 0.5;
    const bagHookHeight = 1.5;
    const bagWidth = 3;
    const bagHeight = 5;
    const uomConversion = 12;

    bagCoOrds.forEach((bag, index) => {
      if (bag) {
        // draw bag hook 
        this.rackCtr.append('rect')
          .attr('x', this.getXCord(bag.x))
          .attr('y', this.getYCord(bag.y))
          .attr('height', bagHookHeight * constants.rackFtScale / this.uomConversion)
          .attr('width', bagHookWidth * constants.rackFtScale / this.uomConversion)
          .attr('stroke-width', 1)
          .attr('stroke', this.getCtrColor('Bag', 'stroke'))
          .attr('fill', this.getCtrColor('Bag', 'stroke'))

        let ellipsisTitleItems = '';

        if (bag.rackItems !== undefined && bag.rackItems.length > 0) {
          ellipsisTitleItems = bag.rackItems.map((rackItem) => {
            return rackItem['ITEM_ID'];
          });
        }

        // draw bag

        this.rackCtr.append('rect')
          .attr('x', this.getXCord((bag.x - (bagWidth / 2) + (bagHookWidth / 2))))
          .attr('y', this.getYCord((bag.y + bagHookHeight)))
          .attr('height', bagHeight * constants.rackFtScale / this.uomConversion)
          .attr('width', bagWidth * constants.rackFtScale / this.uomConversion)
          .attr('stroke-width', 4)
          .attr('stroke', this.getCtrColor('Bag', 'stroke'))
          .attr('fill', this.getCtrColor('Bag', 'fill'))
          .append("svg:title")
          .text(function (d, idx) { return ellipsisTitleItems });
      }
    });


  }

  // hose type rack functions

  buildHoseTypeRack = () => {
    const minHeightOffset = constants.bottomShelfHeight;
    const rackWidth = constants.hoseTypeShaftOuterWidth - constants.hoseTypeShaftInnerWidth;
    const shaftXOffset = (this.rackValues[constants.outerWidth] - constants.hoseTypeShaftOuterWidth) / 2;
    this.drawWheels(this.rackValues[constants.height], this.rackValues[constants.outerWidth], rackWidth);
    return [
      { x: 0, y: this.rackValues[constants.height] },
      { x: 0, y: this.rackValues[constants.height] - minHeightOffset },
      { x: this.rackValues[constants.outerWidth], y: this.rackValues[constants.height] - minHeightOffset },
      { x: this.rackValues[constants.outerWidth], y: this.rackValues[constants.height] },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: this.rackValues[constants.height] },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: this.rackValues[constants.height] - minHeightOffset + rackWidth },
      { x: rackWidth, y: this.rackValues[constants.height] - minHeightOffset + rackWidth },
      { x: rackWidth, y: this.rackValues[constants.height] },
      null,
      { x: rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) - (rackWidth / 2)) },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) - (rackWidth / 2)) },
      { x: this.rackValues[constants.outerWidth] - rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) + (rackWidth / 2)) },
      { x: rackWidth, y: (this.rackValues[constants.height] - (minHeightOffset / 2) + (rackWidth / 2)) },
      null,
      { x: shaftXOffset, y: this.rackValues[constants.height] - minHeightOffset },
      { x: shaftXOffset, y: 0 },
      { x: shaftXOffset + constants.hoseTypeShaftOuterWidth, y: 0 },
      { x: shaftXOffset + constants.hoseTypeShaftOuterWidth, y: this.rackValues[constants.height] - minHeightOffset },
      { x: shaftXOffset + constants.hoseTypeShaftInnerWidth, y: this.rackValues[constants.height] - minHeightOffset },
      { x: shaftXOffset + constants.hoseTypeShaftInnerWidth, y: rackWidth },
      { x: shaftXOffset + rackWidth, y: rackWidth },
      { x: shaftXOffset + rackWidth, y: this.rackValues[constants.height] - minHeightOffset }
    ];
  }

  buildHosePlacements = () => {
    const minHeightOffset = constants.bottomShelfHeight;
    const rackWidth = constants.hoseTypeShaftOuterWidth - constants.hoseTypeShaftInnerWidth;
    const individualPlacmentHeight = (this.rackValues[constants.height] - minHeightOffset) / (this.workCenterRack.numberOfBagHooks);
    const shaftXOffset = (this.rackValues[constants.outerWidth] - constants.hoseTypeShaftOuterWidth) / 2;
    const placementHeightOffset = this.rackValues[constants.height] - minHeightOffset;
    let shelfCoOrds = [];
    let itemCoOrds = [];

    for (let i = 1, previousShelfHeight = individualPlacmentHeight; i <= this.workCenterRack.numberOfBagHooks; i++) {
      const coOrds = [
        null,
        ...this.hosePlacementCoOrdGenerator(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left'),
        null,
        ...this.hosePlacementCoOrdGenerator(shaftXOffset + constants.hoseTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right')
      ];
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      itemCoOrds = [
        ...itemCoOrds,
        (this.workCenterRack.leftHookItems[i - 1].RackItems.length > 0) ? this.buildHoseRackCoOrds(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left', i) : null,
        (this.workCenterRack.rightHookItems[i - 1].RackItems.length > 0) ? this.buildHoseRackCoOrds(shaftXOffset + constants.bagTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right', i) : null
      ];
      previousShelfHeight = previousShelfHeight + individualPlacmentHeight;
    }
    return { placements: shelfCoOrds, itemCoOrds: itemCoOrds };
  }

  hosePlacementCoOrdGenerator = (x, y, orientation) => {
    const rackOrientationCoEff = orientation === 'Left' ? -1 : 1;
    const placementHeight = 6;
    const placementWidth = 6;
    const hosePlacementWidth = 1;

    return [
      { x: x + (placementWidth * rackOrientationCoEff), y },
      { x: x + (placementWidth * rackOrientationCoEff), y: y + hosePlacementWidth },
      { x, y: y + placementHeight + hosePlacementWidth },
      { x, y: y + placementHeight },
      { x: x + (placementWidth * rackOrientationCoEff), y }
    ]
  }

  buildHoseRackCoOrds = (x, y, orientation, index) => {
    const rackOrientationCoEff = orientation === 'Left' ? -1 : 1;
    const placementHeight = 6;
    const placementWidth = 6;
    const hosePlacementWidth = 1;

    const xBeginPtOffset = orientation === 'Left' ? 0.5 : 0;

    const orientationConst = (orientation === 'Left') ? 'leftHookItems' : 'rightHookItems';

    const rackItems = (this.workCenterRack[orientationConst] !== undefined) ? this.workCenterRack[orientationConst][index - 1][constants.rackItems] : [];

    return {
      x: x + (placementWidth * rackOrientationCoEff),
      y: y,
      rackItems: rackItems,
      orientation: orientation
    };
  }

  drawHoses = bagCoOrds => {
    const xcoordinateAdjustment = 5;
    const leftTriangleLength = 235;
    const rightTriangleLength = 285;
    const triangleHeightAdjustment = 33;

    bagCoOrds.forEach((bag, index) => {

      if (bag) {

        let ellipsisTitleItems = '';

        if (bag.rackItems !== undefined && bag.rackItems.length > 0) {
          ellipsisTitleItems = bag.rackItems.map((rackItem) => {
            return rackItem['ITEM_ID'];
          });
        }

        const points = (bag.orientation === 'Left') ? `${(this.getXCord(bag.x) + xcoordinateAdjustment)},${this.getYCord(bag.y)} ${leftTriangleLength},${this.getYCord(bag.y)} ${leftTriangleLength},${(this.getYCord(bag.y) + triangleHeightAdjustment)}` : `${(this.getXCord(bag.x) - xcoordinateAdjustment)},${this.getYCord(bag.y)} ${rightTriangleLength},${this.getYCord(bag.y)} ${rightTriangleLength},${(this.getYCord(bag.y) + triangleHeightAdjustment)}`;

        // draw hoses 
        this.rackCtr.append('polygon')
          .attr('points', points)
          .attr('stroke-width', 1)
          .attr('stroke', constants.bagItemStrokeColor)
          .attr('fill', constants.bagItemColor)
          .append("svg:title")
          .text(function (d, idx) { return ellipsisTitleItems });
      }
    });
  }

  getCtrColor = (type = 'default', key = 'stroke') => {
    key = key + 'Color'
    return constants.ctrColorMap[type] ? constants.ctrColorMap[type][key] : constants.ctrColorMap['default'][key];
  }




}

function wrap(text) {
  text.each(function () {
    var text = d3.select(this);
    var words = text.text().split('').reverse();
    var lineHeight = 12;
    var width = parseFloat(text.attr('width'));
    var y = parseFloat(text.attr('y'));
    var x = text.attr('x');
    var anchor = text.attr('text-anchor');

    var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
    var lineNumber = 0;
    var line = [];
    var word = words.pop();

    while (word) {
      line.push(word);
      tspan.text(line.join(''));
      if (tspan.node().getComputedTextLength() > width) {
        lineNumber += 1;
        line.pop();
        tspan.text(line.join(''));
        line = [word];
        tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(word);
      }
      word = words.pop();
    }
  });
}
