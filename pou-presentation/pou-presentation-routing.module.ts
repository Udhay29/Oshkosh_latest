import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PouPresentationComponent } from './pou-presentation.component';
import { SingleRackComponent } from './single-rack/single-rack.component';
import { AuthGuard } from 'src/app/core/guards/auth-guard';
import { CanDeactivateGuard } from 'src/app/core/guards/can-deactivate-guard';
import { RackBuilderComponent } from './rack-builder/rack-builder/rack-builder.component';

const pouRoutes: Routes = [
  {
    path: '', component: PouPresentationComponent, data: { roles: ['PFEP SPECIALIST'] }, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'single-rack', pathMatch: 'full' },
      { path: 'single-rack', component: SingleRackComponent, canActivate: [AuthGuard] },
      { path: 'rack-builder', component: RackBuilderComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard], data: { roles: ['PFEP SPECIALIST', 'PACKAGING ENGINEER'] } }
    ]
  },

];
@NgModule({
  imports: [RouterModule.forChild(pouRoutes)],
  exports: [RouterModule]
})
export class PouPresentationRoutingModule { }
