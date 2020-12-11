import { autoserialize, autoserializeAs, deserialize, inheritSerialization } from 'cerialize';
import { Observable } from 'rxjs';
import { isEmpty } from '../../shared/empty.util';
import { ListableObject } from '../../shared/object-collection/shared/listable-object.model';
import { link, typedObject } from '../cache/builders/build-decorators';
import { PaginatedList } from '../data/paginated-list';
import { RemoteData } from '../data/remote-data';
import { Bundle } from './bundle.model';
import { BUNDLE } from './bundle.resource-type';
import { Collection } from './collection.model';
import { COLLECTION } from './collection.resource-type';

import { DSpaceObject } from './dspace-object.model';
import { GenericConstructor } from './generic-constructor';
import { HALLink } from './hal-link.model';
import { Relationship } from './item-relationships/relationship.model';
import { RELATIONSHIP } from './item-relationships/relationship.resource-type';
import { ITEM } from './item.resource-type';
import { ChildHALResource } from './child-hal-resource.model';
import { Version } from './version.model';
import { VERSION } from './version.resource-type';

/**
 * Class representing a DSpace Item
 */
@typedObject
@inheritSerialization(DSpaceObject)
export class Item extends DSpaceObject implements ChildHALResource {
  static type = ITEM;

  /**
   * A string representing the unique handle of this Item
   */
  @autoserialize
  handle: string;

  /**
   * The Date of the last modification of this Item
   */
  @deserialize
  lastModified: Date;

  /**
   * A boolean representing if this Item is currently archived or not
   */
  @autoserializeAs(Boolean, 'inArchive')
  isArchived: boolean;

  /**
   * A boolean representing if this Item is currently discoverable or not
   */
  @autoserializeAs(Boolean, 'discoverable')
  isDiscoverable: boolean;

  /**
   * A boolean representing if this Item is currently withdrawn or not
   */
  @autoserializeAs(Boolean, 'withdrawn')
  isWithdrawn: boolean;

  /**
   * The {@link HALLink}s for this Item
   */
  @deserialize
  _links: {
    mappedCollections: HALLink;
    relationships: HALLink;
    bundles: HALLink;
    owningCollection: HALLink;
    templateItemOf: HALLink;
    version: HALLink;
    self: HALLink;
  };

  /**
   * The owning Collection for this Item
   * Will be undefined unless the owningCollection {@link HALLink} has been resolved.
   */
  @link(COLLECTION)
  owningCollection?: Observable<RemoteData<Collection>>;

  /**
   * The version this item represents in its history
   * Will be undefined unless the version {@link HALLink} has been resolved.
   */
  @link(VERSION)
  version?: Observable<RemoteData<Version>>;

  /**
   * The list of Bundles inside this Item
   * Will be undefined unless the bundles {@link HALLink} has been resolved.
   */
  @link(BUNDLE, true)
  bundles?: Observable<RemoteData<PaginatedList<Bundle>>>;

  /**
   * The list of Relationships this Item has with others
   * Will be undefined unless the relationships {@link HALLink} has been resolved.
   */
  @link(RELATIONSHIP, true)
  relationships?: Observable<RemoteData<PaginatedList<Relationship>>>;

  /**
   * Method that returns as which type of object this object should be rendered
   */
  getRenderTypes(): (string | GenericConstructor<ListableObject>)[] {
    const entityType = this.firstMetadataValue('relationship.type');
    if (isEmpty(entityType)) {
      return super.getRenderTypes();
    }
    return [entityType, ...super.getRenderTypes()];
  }

  getParentLinkKey(): keyof this['_links'] {
    return 'owningCollection';
  }
}
