
import { Attribute, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Inject, InjectionToken, Injector, Input, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ChildrenOutletContexts, RouterOutlet } from '@angular/router';


export const OUTLET_NAME = new InjectionToken<string>("primary");

export type Data = {
    [name: string]: any
};

/**
 * An interface that defines the contract for developing a component outlet for the `Router`.
 *
 * An outlet acts as a placeholder that Angular dynamically fills based on the current router state.
 *
 * A router outlet should register itself with the `Router` via
 * `ChildrenOutletContexts#onChildOutletCreated` and unregister with
 * `ChildrenOutletContexts#onChildOutletDestroyed`. When the `Router` identifies a matched `Route`,
 * it looks for a registered outlet in the `ChildrenOutletContexts` and activates it.
 *
 * @see `ChildrenOutletContexts`
 * @publicApi
 */
export interface RouterOutletContract {
    /**
     * Whether the given outlet is activated.
     *
     * An outlet is considered "activated" if it has an active component.
     */
    isActivated: boolean;

    /** The instance of the activated component or `null` if the outlet is not activated. */
    component: Object | null;

    /**
     * The `Data` of the `ActivatedRoute` snapshot.
     */
    activatedRouteData: Data;

    /**
     * The `ActivatedRoute` for the outlet or `null` if the outlet is not activated.
     */
    activatedRoute: ActivatedRoute | null;

    /**
     * Called by the `Router` when the outlet should activate (create a component).
     */
    activateWith(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver | null): void;

    /**
     * A request to destroy the currently activated component.
     *
     * When a `RouteReuseStrategy` indicates that an `ActivatedRoute` should be removed but stored for
     * later re-use rather than destroyed, the `Router` will call `detach` instead.
     */
    deactivate(): void;

    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree.
     *
     * This is similar to `deactivate`, but the activated component should _not_ be destroyed.
     * Instead, it is returned so that it can be reattached later via the `attach` method.
     */
    detach(): ComponentRef<unknown>;

    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree.
     */
    attach(ref: ComponentRef<unknown>, activatedRoute: ActivatedRoute): void;
}

/**
 * @description
 *
 * Act like normal router-outle, 
 * but instead using const PRIMARY_OUTLET as default param in outlatename, it use OUTLET_NAME an Injection Token
 *
 * @see [Routing tutorial](guide/router-tutorial-toh#named-outlets "Example of a named
 * outlet and secondary route configuration").
 * @see `RouterLink`
 * @see `Route`
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Directive({ selector: 'dynamic-router-outlet', exportAs: 'outlet' })
export class DynamicRouterOutlet implements OnDestroy, OnInit, RouterOutletContract {
    private activated: ComponentRef<any> | null = null;
    private _activatedRoute: ActivatedRoute | null = null;
    @Input() name: string;

    @Output('activate') activateEvents = new EventEmitter<any>();
    @Output('deactivate') deactivateEvents = new EventEmitter<any>();

    constructor(
        private parentContexts: ChildrenOutletContexts, private location: ViewContainerRef,
        private resolver: ComponentFactoryResolver, @Attribute("name") name: string,
        private changeDetector: ChangeDetectorRef, @Inject(OUTLET_NAME) outlet : string) {
        this.name = name || outlet;
        parentContexts.onChildOutletCreated(this.name, this as any as RouterOutlet);
    }

    /** @nodoc */
    ngOnDestroy(): void {
        this.parentContexts.onChildOutletDestroyed(this.name);
    }

    /** @nodoc */
    ngOnInit(): void {
        if (!this.activated) {
            // If the outlet was not instantiated at the time the route got activated we need to populate
            // the outlet when it is initialized (ie inside a NgIf)
            const context = this.parentContexts.getContext(this.name);
            if (context && context.route) {
                if (context.attachRef) {
                    // `attachRef` is populated when there is an existing component to mount
                    this.attach(context.attachRef, context.route);
                } else {
                    // otherwise the component defined in the configuration is created
                    this.activateWith(context.route, context.resolver || null);
                }
            }
        }
    }

    get isActivated(): boolean {
        return !!this.activated;
    }

    /**
     * @returns The currently activated component instance.
     * @throws An error if the outlet is not activated.
     */
    get component(): Object {
        if (!this.activated) throw new Error('Outlet is not activated');
        return this.activated.instance;
    }

    get activatedRoute(): ActivatedRoute {
        if (!this.activated) throw new Error('Outlet is not activated');
        return this._activatedRoute as ActivatedRoute;
    }

    get activatedRouteData(): Data {
        if (this._activatedRoute) {
            return this._activatedRoute.snapshot.data;
        }
        return {};
    }

    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree
     */
    detach(): ComponentRef<any> {
        if (!this.activated) throw new Error('Outlet is not activated');
        this.location.detach();
        const cmp = this.activated;
        this.activated = null;
        this._activatedRoute = null;
        return cmp;
    }

    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
     */
    attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute) {
        this.activated = ref;
        this._activatedRoute = activatedRoute;
        this.location.insert(ref.hostView);
    }

    deactivate(): void {
        if (this.activated) {
            const c = this.component;
            this.activated.destroy();
            this.activated = null;
            this._activatedRoute = null;
            this.deactivateEvents.emit(c);
        }
    }

    activateWith(activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver | null) {
        if (this.isActivated) {
            throw new Error('Cannot activate an already activated outlet');
        }
        this._activatedRoute = activatedRoute;
        const component = activatedRoute.routeConfig!.component;
        resolver = resolver || this.resolver;
        const factory = resolver.resolveComponentFactory(component);
        const childContexts = this.parentContexts.getOrCreateContext(this.name).children;
        const injector = new OutletInjector(activatedRoute, childContexts, this.location.injector);
        this.activated = this.location.createComponent(factory, this.location.length, injector);
        // Calling `markForCheck` to make sure we will run the change detection when the
        // `RouterOutlet` is inside a `ChangeDetectionStrategy.OnPush` component.
        this.changeDetector.markForCheck();
        this.activateEvents.emit(this.activated.instance);
    }
}

class OutletInjector implements Injector {
    constructor(
        private route: ActivatedRoute, private childContexts: ChildrenOutletContexts,
        private parent: Injector) { }

    get(token: any, notFoundValue?: any): any {
        if (token === ActivatedRoute) {
            return this.route;
        }

        if (token === ChildrenOutletContexts) {
            return this.childContexts;
        }

        return this.parent.get(token, notFoundValue);
    }
}
