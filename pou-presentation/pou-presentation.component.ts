import { Component, OnInit } from '@angular/core';
import * as constants from './constants';
import { CoreServices } from 'src/app/core/services/core.service';
import { PouSingleRackService } from "./pou-single-rack.service";
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from './../../shared/services/share.service';

@Component({
  selector: 'pfep-pou-presentation',
  templateUrl: './pou-presentation.component.html',
  styleUrls: ['./pou-presentation.component.scss']
})
export class PouPresentationComponent implements OnInit {

  tabsList: Array<Object> = [];
  selectedStack: any;
  isEditable: Boolean = false;
  public href: string = "";
  singleRackKey = constants.singleRackKey;

  constructor(public coreService: CoreServices,
    public pouSingleRackService: PouSingleRackService,
    private route: ActivatedRoute, public router: Router,
    public sharedService: SharedService) { }

  ngOnInit() {
    const routeRoles = this.route.snapshot.data.roles;
    this.pouSingleRackService.setEditAccess(this.coreService.checkAccess(routeRoles));
    this.tabsList = constants.pouPresentationTabsList;
    this.setPageParam();
    this.pouSingleRackService.getTabClickSub().subscribe(val => {
      this.selectedStack = val;
    })
  }

  onTabClick = (selectedTab, shouldNavigate) => {
    this.selectedStack = selectedTab;
    if (shouldNavigate) { this.router.navigate([`pou/${selectedTab}`]); }
  }

  setPageParam = () => {
    switch (this.router.url) {
      case '/pou/single-rack':
        this.onTabClick(constants.singleRackKey, false);
        break;

      case '/pou/rack-builder':
        this.onTabClick(constants.rackBuilderKey, false);
        break;

      case '/pou':
        this.onTabClick(constants.singleRackKey, true);
        break;
    }
  }

  routeAttached = () => {
    const routePath = this.sharedService.getCbReqData()['parentScreenPath'];
    if (routePath) {
      const route = routePath.split('/');
      switch (route[route.length - 1]) {
        case 'single-rack':
          this.sharedService.routeAttached('single-rack');

        case 'rack-builder':
          this.sharedService.routeAttached(constants.rackBuilderKey);
      }

    }
  }

}
