import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router, Routes } from '@angular/router';

@Component({
  selector: 'modal-router',
  templateUrl: './modal-router.component.html',
  styles: [':host{display:contents}']
})
export class ModalRouterComponent implements OnInit {

  @Input("name") name : string;
  @Input("routes") routes : Routes;
  @Input("initialNavigation") initialNavigation : [commands: any[], extras?: NavigationExtras]

  cname:string;
  renderrouter=false;

  constructor(
    private router:Router
  ) { }

  ngOnInit(){
    this.cname=this.name;
    this.renderrouter = true;
    if(this.initialNavigation){
      let path = {};
      path[this.name]=this.initialNavigation[0];
      this.router.navigate([{outlets:path}],this.initialNavigation[1])
    }
    else{
      let path = {};
      path[this.name]=[this.routes[0].path];
      this.router.navigate([{outlets:path}])
    }
  }

}
