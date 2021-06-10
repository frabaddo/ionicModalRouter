import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Routes } from '@angular/router';
import { ModalRouterController } from '../modal-router.service';

@Component({
  selector: 'modal-router',
  templateUrl: './router.component.html',
  styleUrls: ['./router.component.scss']
})
export class RouterComponent implements OnInit {

  @Input("name") name : string;
  @Input("routes") routes : Routes;
  @Input("initialNavigation") initialNavigation : [commands: any[], extras?: NavigationExtras]

  template:string;
  renderrouter=false;

  constructor(
    private modalrouter:ModalRouterController
  ) { }

  ngOnInit(){
    this.template = '<style> router-outlet ~ * { height:100% } </style> <router-outlet name="'+this.name+'"></router-outlet>';
    this.renderrouter = true;
    if(this.initialNavigation){
      this.modalrouter.navigate(this.initialNavigation[0],this.initialNavigation[1],this.name);
    }
    else{
      this.modalrouter.navigate([this.routes[0].path],undefined,this.name);
    }
  }

}
