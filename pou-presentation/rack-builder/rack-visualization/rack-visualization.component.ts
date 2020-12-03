import { Component, OnInit, OnChanges, Input } from '@angular/core';
import * as d3 from 'd3';
import * as constants from '../rack-builder-constants';
import { RackBuilderService } from '../rack-builder.service';

@Component({
  selector: 'pfep-rack-visualization',
  templateUrl: './rack-visualization.component.html',
  styleUrls: ['./rack-visualization.component.scss']
})
export class RackVisualizationComponent implements OnInit {
  @Input() rackValues: any = {};

  rackType: string = '';
  lineGenerator: any;
  rackCtr: any;
  uomConversion = 12;
  rackHeight = constants.height
  visualizationCtrDims = {
    height: 530,
    width: 700
  }

  constructor(public rackBuilderService: RackBuilderService) { }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    if (changes.rackValues) {
      this.rackType = this.rackValues[constants.rackTypesKey];
      const currentrackValue = changes.rackValues.currentValue;
      this.clearRack();
      if (currentrackValue && Object.keys(currentrackValue).length > 0) {
        this.rackGenerator();
      }
    }
  }

  getClassState = () => {
    if (Object.keys(this.rackValues).length > 0 && this.rackValues[constants.height] > 0) {
      return false;
    }

    return true;
  }

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

    this.buildItems(placementCoOrds.itemCoOrds);

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


  buildItems = itemCoOrds => {

    switch (this.rackType) {
      case constants.shelfTypeKey:
        this.drawRollers(itemCoOrds);
        break;

      case constants.hoseReelTypeKey:
        this.drawHoseReels(itemCoOrds);
        break;

      case constants.bagTypeKey:
        this.drawBags(itemCoOrds);
        break;

      case constants.hoseTypeKey:
        //this.drawHoses(itemCoOrds);
        break;
    }
  }


  drawWheels = (height, rackOuterWidth, rackWidth) => {

    const uomConversion = 12;
    const wheelHolderHeight = 1;
    const wheelGuardHeight = 3.5;
    const wheelHeight = 5;
    const wheelWidth = 1;
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
      let radius = (this.getXCord(pt.x + rackWidth / 2) - this.getXCord(pt.x + 0.5));
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

  shelfCoOrdinates = () => {
    let shelfCoOrds = [];
    let itemCoOrds = [];
    //TODO: convert the below acc to UOM
    const individualShelfHeight = (this.rackValues[constants.height] - constants.bottomShelfHeight) / (this.rackValues[constants.totalPlacements]);
    const rackWidth = (this.rackValues[constants.outerWidth] - this.rackValues[constants.innerWidth]) / 2;

    for (let i = 1, previousShelfHeight = constants.bottomShelfHeight; i <= this.rackValues[constants.totalPlacements]; i++) {
      const coOrds = [
        null,
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] },
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] }
      ];
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      itemCoOrds = this.rackValues[constants.rollers] ? [...itemCoOrds, { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight - this.rackValues[constants.shelfHeight] }] : itemCoOrds;
      previousShelfHeight = previousShelfHeight + individualShelfHeight;
    }
    return { placements: shelfCoOrds, itemCoOrds };
  }

  drawRollers = placementCoOrds => {
    //this.rackValues[constants.innerWidth], this.rackValues[constants.rollersPerShelf]
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
    const individualShelfHeight = (this.rackValues[constants.height]) / (this.rackValues[constants.totalPlacements]);
    const rackWidth = (this.rackValues[constants.outerWidth] - this.rackValues[constants.innerWidth]) / 2;

    for (let i = 1, previousShelfHeight = individualShelfHeight; i <= this.rackValues[constants.totalPlacements]; i++) {
      const coOrds = [
        null,
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + constants.hoseShaftheight + (constants.hoseReelsHeight / 2) },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + constants.hoseShaftheight + (constants.hoseReelsHeight / 2) },
        { x: this.rackValues[constants.innerWidth] + rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + (constants.hoseReelsHeight / 2) },
        { x: rackWidth, y: this.rackValues[constants.height] - previousShelfHeight + (constants.hoseReelsHeight / 2) }
      ];
      previousShelfHeight = previousShelfHeight + individualShelfHeight;
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      itemCoOrds = [...itemCoOrds, this.buildHoseReels(coOrds)];
    }
    return { placements: shelfCoOrds, itemCoOrds };

  }

  buildHoseReels = placement => {
    //TODO: convert the below acc to UOM
    const widthOffset = 8;
    const hoseReelWidth = this.rackValues[constants.innerWidth] - widthOffset;
    return {
      x: placement[1].x + (widthOffset / 2),
      y: placement[4].y - (constants.hoseReelsHeight / 2),
      width: hoseReelWidth,
      height: constants.hoseReelsHeight
    };
  }

  drawHoseReels = coOrds => {
    const uomConversion = 12;
    coOrds.forEach(pt => {
      this.rackCtr.append('rect')
        .attr('x', this.getXCord(pt.x))
        .attr('y', this.getYCord(pt.y))
        .attr('height', pt.height * constants.rackFtScale / this.uomConversion)
        .attr('width', pt.width * constants.rackFtScale / this.uomConversion)
        .attr('stroke-width', 4)
        .attr('stroke', constants.hoseReelItemColor)
        .attr('fill', constants.hoseReelItemColor);

      const ellipseCoOrds = [
        { x: pt.x, y: pt.y + pt.height / 2, rx: 5, ry: pt.height },
        { x: pt.x + pt.width, y: pt.y + pt.height / 2, rx: 5, ry: pt.height },
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
    const individualPlacmentHeight = (this.rackValues[constants.height] - minHeightOffset) / (this.rackValues[constants.totalPlacements]);
    const rackWidth = constants.bagTypeShaftOuterWidth - constants.bagTypeShaftInnerWidth;
    const shaftXOffset = (this.rackValues[constants.outerWidth] - constants.bagTypeShaftOuterWidth) / 2;
    const placementHeightOffset = this.rackValues[constants.height] - minHeightOffset;
    let shelfCoOrds = [];
    let itemCoOrds = [];

    for (let i = 1, previousShelfHeight = individualPlacmentHeight; i <= this.rackValues[constants.totalPlacements]; i++) {
      const coOrds = [
        null,
        ...this.bagPlacementCoOrdGenerator(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left'),
        null,
        ...this.bagPlacementCoOrdGenerator(shaftXOffset + constants.bagTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right')
      ];
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      itemCoOrds = [
        ...itemCoOrds,
        this.buildBagCoOrds(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left'),
        this.buildBagCoOrds(shaftXOffset + constants.bagTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right')
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

  buildBagCoOrds = (x, y, orientation) => {
    const rackOrientationCoEff = orientation === 'Left' ? -1 : 1;
    const xBeginPtOffset = orientation === 'Left' ? 0.5 : 0

    return {
      x: x + ((2.25 + xBeginPtOffset) * rackOrientationCoEff),
      y: y + 1
    };
  }

  drawBags = bagCoOrds => {
    const bagHookWidth = 0.5;
    const bagHookHeight = 1.5;
    const bagWidth = 3;
    const bagHeight = 5;
    const uomConversion = 12;

    bagCoOrds.forEach(bag => {
      // draw bag hook 
      this.rackCtr.append('rect')
        .attr('x', this.getXCord(bag.x))
        .attr('y', this.getYCord(bag.y))
        .attr('height', bagHookHeight * constants.rackFtScale / this.uomConversion)
        .attr('width', bagHookWidth * constants.rackFtScale / this.uomConversion)
        .attr('stroke-width', 1)
        .attr('stroke', constants.bagItemStrokeColor)
        .attr('fill', constants.bagItemColor);

      // draw bag
      this.rackCtr.append('rect')
        .attr('x', this.getXCord((bag.x - (bagWidth / 2) + (bagHookWidth / 2))))
        .attr('y', this.getYCord((bag.y + bagHookHeight)))
        .attr('height', bagHeight * constants.rackFtScale / this.uomConversion)
        .attr('width', bagWidth * constants.rackFtScale / this.uomConversion)
        .attr('stroke-width', 4)
        .attr('stroke', constants.bagItemStrokeColor)
        .attr('fill', constants.bagItemColor);
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
    const individualPlacmentHeight = (this.rackValues[constants.height] - minHeightOffset) / (this.rackValues[constants.totalPlacements]);
    const shaftXOffset = (this.rackValues[constants.outerWidth] - constants.hoseTypeShaftOuterWidth) / 2;
    const placementHeightOffset = this.rackValues[constants.height] - minHeightOffset;
    let shelfCoOrds = [];
    let itemCoOrds = [];

    for (let i = 1, previousShelfHeight = individualPlacmentHeight; i <= this.rackValues[constants.totalPlacements]; i++) {
      const coOrds = [
        null,
        ...this.hosePlacementCoOrdGenerator(shaftXOffset, placementHeightOffset - previousShelfHeight, 'Left'),
        null,
        ...this.hosePlacementCoOrdGenerator(shaftXOffset + constants.hoseTypeShaftOuterWidth, placementHeightOffset - previousShelfHeight, 'Right')
      ];
      shelfCoOrds = [...shelfCoOrds, ...coOrds];
      previousShelfHeight = previousShelfHeight + individualPlacmentHeight;
    }
    return { placements: shelfCoOrds, itemCoOrds: [] };
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



}