import { Injectable } from '@angular/core';
import { NavigationExtras, Router, Routes, ɵEmptyOutletComponent } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { RouterComponent } from './router/router.component';

type namedNavigate = (commands: any[], extras?: NavigationExtras, name?:string) => Promise<boolean>;

export type ModalRouterOptions = {
  routes? : Routes; 
  outletName : string;
  initialNavigation? : [commands: any[], extras?: NavigationExtras]
}

type CreateModalRouter = (options: ModalRouterOptions )=>Promise<HTMLIonModalElement>


@Injectable()
export class ModalRouterController {

  defaultRouterName : string = "primarymodalrouter";

  private readonly modals : Map<string,{element:HTMLIonModalElement,routesYetRegistered:boolean}> = new Map<string,{element:HTMLIonModalElement,routesYetRegistered:boolean}>();

  constructor(
    private modalCtrl : ModalController,
    private router: Router
  ) { }

  /**
 * Creates modal router controller
 * @param routes a list of routes to load inside modal, if omitted is retrieved from already loaded routes, with outle outletName
 * @param [outletName] must be unique in all router if routes is provided, elsewhere some routes outlet Must match this name
 * @param [initialNavigation] Warning: extra are not scooped to this secondary router
 * @returns HTMLIonModalElement ready to be presented 
 */
  public async create(opts: ModalRouterOptions):Promise<HTMLIonModalElement>{
    if(opts.routes) return this.createWithRoutes(opts);
    else return this.createWithoutRoutes(opts);
  }

/**
 * Creates modal router controller
 * @param routes follow named router outlet, routes sintax, if is not provided an initialNavigation, the first route is loaded on presenting
 * @param [outletName] must be unique in all router
 * @param [initialNavigation] Warning: extra are not scooped to this secondary router
 * @returns HTMLIonModalElement ready to be presented 
 */
private createWithRoutes : CreateModalRouter = async ({routes, outletName = this.defaultRouterName, initialNavigation = undefined} : ModalRouterOptions) : Promise<HTMLIonModalElement> => {
    if(this.modals.has(outletName)) throw("modal-router with same name already exists");
    if(this.routesWithOutletNameExists(outletName,this.router.config)) throw("outlet name already exists in some routes");
    this.modals.set(outletName,undefined);
    this.addRoutes(routes,outletName);
    return this.modalCtrl.create({
      component:RouterComponent,
      cssClass:["modal-router"],
      componentProps:{
        name: outletName,
        routes: routes,
        initialNavigation: initialNavigation
      }
    })
    .then((modal)=>{
      modal.onDidDismiss().then(()=>{
        this.removeRoutes(outletName);
        let path={};
        path[outletName]=null;
        this.router.navigate([{outlets:path}]);
        this.modals.delete(outletName);
      })
      this.modals.set(outletName,{element:modal,routesYetRegistered:false});
      return modal;
    })
    .catch((err)=>{
      this.removeRoutes(outletName);
      this.modals.delete(outletName);
      throw(err);
    })
  }

  /**
 * Creates modal router controller
 * @param [outletName] must be unique in all router
 * @param [initialNavigation] Warning: extra are not scooped to this secondary router
 * @returns HTMLIonModalElement ready to be presented 
 */
  private createWithoutRoutes : CreateModalRouter = async ({routes ,outletName = this.defaultRouterName, initialNavigation = undefined} : ModalRouterOptions) : Promise<HTMLIonModalElement> => {
    if(this.modals.has(outletName)) throw("modal-router with same name already exists");
    if(!initialNavigation) throw("initialNavigation must be provided if no routes are provided");
    this.modals.set(outletName,undefined);
    return this.modalCtrl.create({
      component:RouterComponent,
      cssClass:["modal-router"],
      componentProps:{
        name: outletName,
        initialNavigation: initialNavigation
      }
    })
    .then((modal)=>{
      modal.onDidDismiss().then(()=>{
        let path={};
        path[outletName]=null;
        this.router.navigate([{outlets:path}]);
        this.modals.delete(outletName);
      })
      this.modals.set(outletName,{element:modal,routesYetRegistered:true});
      return modal;
    })
    .catch((err)=>{
      this.modals.delete(outletName);
      throw(err);
    })
  }

  public get(name:string = this.defaultRouterName) : HTMLIonModalElement | undefined {
    return this.modals.get(name) && this.modals.get(name).element
  }

  public getTop():{ name:string, ref:HTMLIonModalElement }{
    let el = [...this.modals][this.modals.size-1];
    if(el) return {
      name:el[0],
      ref:el[1].element
    }
    else return undefined;
  }

  public dismiss(name:string=undefined) : Promise<boolean> {
    if(name==undefined && this.getTop()) name = this.getTop().name;
    return this.modals.get(name) && this.modals.get(name).element.dismiss()
  }
  
  public navigate : namedNavigate = (command, extra = undefined, name = this.getTop().name) => {
    let path = {};
    //if(!this.modals.get(name).routesYetRegistered) command.unshift(name);
    path[name]=command;
    return this.router.navigate([{outlets:path}],extra)
  }

  private routesWithOutletNameExists(name:string, routes:Routes){
    if(!routes || routes==[]) return false;
    else return routes.some((route)=>route.outlet==name||this.routesWithOutletNameExists(name,route.children));
  }

  private addRoutes(routes:Routes, name:string = this.defaultRouterName){
    let enchanchedRoutes : Routes = [{
      path:"",
      component:ɵEmptyOutletComponent,
      children:routes,
      outlet:name
    }];
    this.router.config = enchanchedRoutes.concat(this.router.config);
    //this.router.resetConfig(enchanchedRoutes.concat(this.router.config));
  }
  private removeRoutes(name:string = this.defaultRouterName){
    this.router.config = this.router.config.filter((el)=>el.outlet!=name);
  }
}
