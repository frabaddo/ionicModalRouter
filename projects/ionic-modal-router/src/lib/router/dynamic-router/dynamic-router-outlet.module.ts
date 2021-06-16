import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DynamicRouterOutlet } from './dynamic_router_outlet';

@NgModule({
    declarations: [
        DynamicRouterOutlet
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([])
    ],
    exports:[
        DynamicRouterOutlet
    ]
})
export class DynamicRouterOutletModule { 
}