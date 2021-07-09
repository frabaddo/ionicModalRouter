
# ionic-modal-router

ionic-modal-router is a Ionic/Angular library for create modal with nested router.

## Installation

```bash
npm install ionic-modal-router
```

## Required Dependency
```bash
angular >= 10.0.0
ionic >= 5.0.0
```

## Add to modules

in app.module.ts
```typescript
@NgModule({
  ...
  imports: [
    ... 
    ModalRouterModule.forRoot()
  ],
  ...
})
export class AppModule { }
```

in other module
```typescript
@NgModule({
  ...
  imports: [
    ... 
    ModalRouterModule
  ],
  ...
})
export class AppModule { }
```

## Usage

in your component
```typescript
import { ModalRouterController } from "ionic-modal-router"

...

constructor(
    private modalRouterController: ModalRouterController
 ) { }

...

openModal(){
  this.modalRouterController.create({
    outletName:"test",
    routes:[{
      path:"default",
      loadChildren: () => import('../feature/feature.module').then( m => m.FeaturePageModule)
    }]
  }).then((modal)=>{
    modal.present()
  })
}

```

## Methods

```
create( opts : ModalRouterOptions ) => Promise<HTMLIonModalElement>

get( nameOfTheOutlet : string ) => HTMLIonModalElement | undefined

getTop() => { name:string, ref:HTMLIonModalElement }

dismiss(name : string | undefined) => Promise<boolean> #dismiss the top modal ore the modal with given name

navigate (commands: any[], extras?: NavigationExtras, nameOfTheOutlet?:string) => Promise<boolean>;
```

## Types

```
# ModalRouterOptions 
{
  routes? : any[]; # a list of routes to load inside modal, if omitted is retrieved from already loaded routes, with outle outletName
  outletName? : string; # use for multi parallel modal; required if no routes are passed
  cssClass?: string | string[],
  showBackdrop?:boolean,
  backdropDismiss?:boolean,
  initialNavigation? : [commands: any[], extras?: NavigationExtras] # default first route in routes
}
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
