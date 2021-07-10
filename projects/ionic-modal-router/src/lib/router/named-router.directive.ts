import { CommonModule } from "@angular/common";
import { Compiler, Component, ComponentRef, Directive, Injector, Input, ModuleWithComponentFactories, NgModule, NgModuleRef, OnDestroy, OnInit, Type, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DynamicRouterOutletModule } from "./dynamic-router/dynamic-router-outlet.module";
import { DynamicRouterOutlet, OUTLET_NAME } from "./dynamic-router/dynamic_router_outlet";

@Component({
  selector: 'router-container',
  template: "<style> dynamic-router-outlet ~ * { height:100% } </style> <dynamic-router-outlet></dynamic-router-outlet>",
  styles:[":host{display:contents}"],
  encapsulation:ViewEncapsulation.ShadowDom
})
class CustomDynamicComponent {}

@Directive({
  selector: '[namedRouter]'
})
export class NamedRouterDirective implements OnInit, OnDestroy {
  @Input() namedRouter: string;

  compRef: ComponentRef<any>;

  moduleProviderRef : NgModuleRef<any>;

  constructor(private vcRef: ViewContainerRef, private compiler: Compiler,private injector:Injector) {}

  ngOnInit() {
    if(!this.namedRouter) {
      throw Error('You forgot to provide a name');
    }

    this.vcRef.clear();

    const module = this.createDynamicModule();
    const moduleProviders = this.createProvidersDynamicModule();
    this.compiler.compileModuleAndAllComponentsAsync(module)
      .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
        this.compiler.compileModuleAndAllComponentsAsync(moduleProviders)
        .then((providers : ModuleWithComponentFactories<any>)=>{
          let compFactory = moduleWithFactories.componentFactories.find(x => x.componentType === CustomDynamicComponent);
          this.moduleProviderRef = providers.ngModuleFactory.create(this.injector);
          this.compRef = this.vcRef.createComponent(compFactory,0,this.injector,[],this.moduleProviderRef);
        })
      })
      .catch(error => {
        console.log(error);
      });
  }

  ngOnDestroy(){
    if(this.moduleProviderRef) this.moduleProviderRef.destroy();
  }

  private createDynamicModule () {
    @NgModule({
      imports: [CommonModule,DynamicRouterOutletModule],
      declarations: [CustomDynamicComponent]
    })
    class DynamicModule {}
    let module = DynamicModule;
    return module;
  }

  private createProvidersDynamicModule () {
    var value = this.namedRouter
    @NgModule({
      providers:[{provide: OUTLET_NAME,useValue:value}]
    })
    class DynamicProvideModule {}
    let module = DynamicProvideModule;
    return module;
  }
}