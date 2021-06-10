import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalRouterController } from './modal-router.service';
import { RouterModule } from '@angular/router';
import { RouterComponent } from './router/router.component';
import { CompileDirective } from './router/compile.directive';

@NgModule({
  declarations: [
    RouterComponent,
    CompileDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    IonicModule
  ]
})
export class ModalRouterModule { 
  static forRoot(): ModuleWithProviders<ModalRouterModule> {
    return {
      ngModule: ModalRouterModule,
      providers:[ ModalRouterController ]
    };
  }
}
