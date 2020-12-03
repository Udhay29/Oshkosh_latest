import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { SharedService } from './../../../../shared/services/share.service';
import { RackBuilderService } from '../../rack-builder/rack-builder.service';
import { SvgSingleRackService } from './svg-single-rack.service';

@Component({
  selector: 'pfep-svg-single-rack',
  templateUrl: './svg-single-rack.component.html',
  styleUrls: ['./svg-single-rack.component.scss']
})
export class SvgSingleRackComponent implements OnInit {

  rackValues: any;
  handStackHeight: any = 'auto';

  constructor(
    public rackBuilderService: RackBuilderService,
    public sharedService: SharedService,
    private readonly svgSingleRackService: SvgSingleRackService
  ) { }

  ngOnInit() {
    this.generateSvg();
  }

  generateSvg() {
    this.rackValues = this.sharedService.getSingelRacksvg();
    this.svgSingleRackService.generateSvg();
    this.handStackHeight = this.svgSingleRackService.handStackHeight;
  }


}
