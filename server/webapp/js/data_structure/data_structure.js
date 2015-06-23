/**
 * Created by Marvin Therolf on 15.06.15.
 */

/**
 * The container object is the main data structure in the StorMe business logic. It consists of a container name, a
 * unique id which also encodes the position of the container inside the storage and three arrays holding the containers
 * attributes, sub containers and contained items.<br>
 * <br>
 * A StorMe storage basically consists of a singe container given the container id "0".The storage is organized by
 * adding containers to the sub container array. The first sub container will get the id "0-0", the second will get the
 * id "0-1", the first sub container of container "0-0" will get the id "0-0-0" and so on. This creates a tree structure
 * that greatly represents the reality of the storage situation and supports a fast search.
 * @constructor
 * @param {String} containerName    - Name of the constructed container
 * @prop {String} containerID       - Unique identifier (form: 0-1-...-2)
 * @prop {String} containerName     - Container name
 * @prop {Array} attributes         - Attributes of this container (see class ContainerAttribute)
 * @prop {Array} subContainers      - Sub containers of this container
 * @prop {Array} items              - Items contained by this container (see class ContainerItem)
 * @author Marvin Therolf
 */
function Container(containerName)
{
    this.containerID = "0";
    this.containerName = containerName;
    this.attributes = [];
    this.subContainers = [];
    this.items = [];
}

/**
 * Returns all items contained by the given container and its sub containers. The returned array is an array of
 * ContainerItem objects.
 * @function
 * @param {Container} container     - Container from where to start gathering items
 * @returns {Array} Array of ContainerItems
 * @author Marvin Therolf
 */
getAllItems = function(container)
{
    var allItems = container.items;

    for (var i = 0; i < container.subContainers.length; i++)
    {
        var subContainer = container.subContainers[i];
        allItems = allItems.concat(getAllItems(subContainer));
    }
    return allItems;
};

/**
 * Returns a set of all attributes of all items contained by the given container and its subcontainers. The returned
 * array is an array of ItemAttribute Objects.
 * @function
 * @param {Container} container     - Container from where to start gathering attributes
 * @returns {Array} Array of ItemAttributes
 * @author Marvin Therolf
 */
getAllItemAttributes = function(container)
{
    var allAttributes = [];
    var allItems = getAllItems(container);
    var allDataItems = getDataItems(allItems);

    // special contains function for internal usage only
    var containsAttribute = function(attributes, attribute)
    {
        var result = false;

        for (var i = 0; i < attributes.length; i++)
        {
            if (attributes[i].attributeName === attribute.attributeName)
            {
                result = true;
                break;
            }
        }
        return result;
    };

    for (var i = 0; i < allDataItems.length; i++)
    {
        var currentItem = allDataItems[i];

        for (var k = 0; k < currentItem.attributes.length; k++)
        {
            var currentAttribute = currentItem.attributes[k];

            if (!containsAttribute(allAttributes, currentAttribute))
            {
                allAttributes.push(currentAttribute);
            }
        }
    }
    return allAttributes;
};

/**
 * Transfers an array of ContainerItems into an array of Items enabling a data base connection in the process to fetch
 * the item information.
 * @function
 * @param {Array} containerItems        - Array of ContainerItems
 * @returns {Array} Array of Items
 * @author Marvin Therolf
 */
getDataItems = function(containerItems)
{
    var dataItems = [];

    for (var i = 0; i < containerItems.length; i++)
    {
        var currentContainerItem = containerItems[i];
        var dataItem = getDataItemFromCouch(currentContainerItem.itemID);
        dataItems.push(dataItem);
    }
    return dataItems;
};

/**
 * Adds a ContainerAttribute to a container.
 * @function
 * @param {Container} container             - Container to add attribute to
 * @param {ContainerAttribute} attribute    - Attribute added to container
 * @author Marvin Therolf
 */
addContainerAttribute = function(container, attribute)
{
    container.attributes.push(attribute);
};

/**
 * Removes a ContainerAttribute from a container.
 * @function
 * @param {Container} container     - Container to remove attribute from
 * @param {String} attributeName    - Name of the attribute removed from container
 * @author Marvin Therolf
 */
removeContainerAttribute = function(container, attributeName)
{
    for (var i = 0; i < container.attributes.length; i++)
    {
        if (container.attributes[i].attributeName === attributeName)
        {
            removeFromArray(container.attributes, i);
            break;
        }
    }
};

/**
 * Removes all ContainerAttributes from a container.
 * @function
 * @param {Container} container     - Container to remove attributes from
 * @author Marvin Therolf
 */
removeAllContainerAttributes = function(container)
{
    container.attributes = [];
};

/**
 * Returns all container attributes contained by the given container and its sub containers. The returned array is an array of
 * ContainerAttributes objects.
 * @function
 * @param {Container} container     - Container from where to start gathering items
 * @returns {Array} Array of ContainerAttributes
 * @author Marcel Groß
 */
getAllContainerAttributes = function(container)
{
    var allAttributes = container.attributes;

    for (var i = 0; i < container.subContainers.length; i++)
    {
        var subContainer = container.subContainers[i];
        allAttributes = allAttributes.concat(getAllContainerAttributes(subContainer));
    }
    return allAttributes;
};

/**
 * Returns all compulsory container attributes contained by the given container and its sub containers. The returned array is an array of
 * ContainerAttributes objects.
 * @function
 * @param {Container} container     - Container from where to start gathering items
 * @returns {Array} Array of ContainerAttributes
 * @author Marcel Groß
 */
getAllCompulsoryContainerAttributes = function(container)
{
    var allCompulsoryAttributes = [];
    var allContainerAttributes = getAllContainerAttributes(container);

    for (var i = 0; i < allContainerAttributes.length; i++)
    {
        var currentContainerAttribute = allContainerAttributes[i];

        if (currentContainerAttribute.compulsory)
        {
            allCompulsoryAttributes.push(currentContainerAttribute);
        }
    }
    return allCompulsoryAttributes;
};


/**
 * Adds a sub container to a container.
 * @function
 * @param {Container} container     - Container to add sub container to
 * @param {Container} subContainer  - Sub container added to container
 * @author Marvin Therolf
 */
addSubContainer = function(container, subContainer)
{
    var id = findFreeID(container);
    subContainer.containerID = id;
    container.subContainers.push(subContainer);

    var subContainers = copyArray(subContainer.subContainers);
    removeAllSubContainers(subContainer);

    for (var i = 0; i < subContainers.length; i++)
    {
        addSubContainer(subContainer, subContainers[i]);
    }
};

/**
 * Adds the given Amount of sub containers to the given container. Sub containers are all created within this function
 * and are named after the given prefix followed by an upcounting number (starting with 0);
 * @function
 * @param {Container} container         - Container to add sub containers to
 * @param {String} subContainerPrefix   - Prefix after which sub containers are named
 * @param {Number} amount               - Amount of sub containers to created and add
 * @param {Array} attributes            - Array of ContainerAttribute objects (may be null)
 * @author Marvin Therolf
 */
addSubContainers = function(container, subContainerPrefix, amount, attributes)
{
    for (var i = 0; i < amount; i++)
    {
        var subContainer = new Container(subContainerPrefix + i);
        subContainer.attributes = attributes;
        addSubContainer(container, subContainer);
    }
};

/**
 * Removes a sub container from a given container using the sub containers containerID.
 * @function
 * @param {Container} container     - Container to remove sub container from
 * @param {String} subContainerID   - ContainerID of the sub container to remove
 * @author Marvin Therolf
 */
removeSubContainer = function(container, subContainerID)
{
    for (var i = 0; i < container.subContainers.length; i++)
    {
        if (container.subContainers[i].containerID === subContainerID)
        {
            removeFromArray(container.subContainers, i);
            break;
        }
    }
};

/**
 * Removes all sub containers from a given container.
 * @function
 * @param {Container} container     - Container to remove sub containers from
 * @author Marvin Therolf
 */
removeAllSubContainers = function(container)
{
    container.subContainers = [];
};

/**
 * Adds a given amount of ContainerItems to the container.
 * @function
 * @param {Container} container     - Container to add items to
 * @param {String} itemID           - ItemID of the item to add
 * @param {Number} amount           - Amount of items to add to the container
 * @author Marvin Therolf
 */
addItem = function(container, itemID, amount)
{
    var containerItem = containsItem(container, itemID);

    if (containerItem != null)
    {
        increaseAmount(containerItem, amount);
    }
    else
    {
        containerItem = new ContainerItem(itemID, amount);
        containerItem.parentContainerID = container.containerID;
        container.items.push(containerItem);
    }
};

/**
 * Checks if a container contains an item by checking the items id. Doesn't check sub containers. Returns the item if
 * found in form of a ContainerItem. Returns null otherwise.
 * @function
 * @param {Container} container     - Container to check
 * @param {String} itemID           - ID of searched item
 * @returns {ContainerItem} ContainerItem if found, null otherwise
 * @author Marvin Therolf
 */
containsItem = function(container, itemID)
{
    var result = null;

    for (var i = 0; i < container.items.length; i++)
    {
        if (container.items[i].itemID === itemID)
        {
            result = container.items[i];
            break;
        }
    }
    return result;
};

/**
 * Removes an amount of items from a given container.
 * @function
 * @param {Container} container     - Container to remove items from
 * @param {String} itemID           - ItemID of item to remove
 * @param {Number} amount           - amount of items to remove
 * @author Marvin Therolf
 */
removeItem = function(container, itemID, amount)
{
    for (var i = 0; i < container.items.length; i++)
    {
        if (container.items[i].itemID === itemID)
        {
            if (container.items[i].amount === amount)
            {
                removeFromArray(container.items, i);
            }
            else
            {
                decreaseAmount(container.items[i], amount);
            }
            break;
        }
    }
};

/**
 * Removes all items from a given container.
 * @function
 * @param {Container} container     - Container to removes all items from
 * @author Marvin Therolf
 */
removeAllItems = function(container)
{
    container.items = [];
};

/**
 * Dynamically finds the first free container id for a newly added sub container. If you e.g. already have a container with
 * the container id "0-1" and this container contains the sub containers "0-1-0", "0-1-1" and "0-1-3", this function
 * will return "0-1-2" as this is the first free sub container id.
 * @function
 * @param {Container} container     - Container from where to start looking for an id
 * @returns {String} Next free container id
 * @author Marvin Therolf
 */
findFreeID = function(container)
{
    var freeSubID = container.subContainers.length;
    var subContainerSubIDs = [];

    for (var i = 0; i < container.subContainers.length; i++)
    {
        var subContainerID = container.subContainers[i].containerID;
        var subContainerIDAsArray = subContainerID.split("-");
        var subContainerSubID = subContainerIDAsArray.pop();
        subContainerSubIDs.push(subContainerSubID);
    }
    subContainerSubIDs.sort(sortNumerically);

    for (var k = 0; k < subContainerSubIDs.length; k++)
    {
        if (subContainerSubIDs[k] != k)
        {
            freeSubID = k;
            break;
        }
    }
    return container.containerID + "-" + freeSubID;
};

/**
 * Generates a String representation of a given container. This is like a static version of the containers toString()-
 * function. This is not going to be a JSON.<br>
 * <br>
 * Recursive.
 * @function
 * @param {Container} container     - Container to represent as a String
 * @returns {String} Representation
 * @author Marvin Therolf
 */
print = function(container)
{
    var result = container.containerID + "\t" + container.containerName + "\n";

    for (var i = 0; i < container.subContainers.length; i++)
    {
        result += print(container.subContainers[i]);
    }
    return result;
};

/**
 * Finds and returns a container starting at a given container recursively checking the container id.
 * @function
 * @param {Container} container     - Container to start the search at
 * @param {String} searchedID       - ContainerID of the searched container
 * @returns {Container} Searched container, or null if container wasn't found
 * @author Marvin Therolf and Marcel Groß
 */
getContainerById = function(container, searchedID)
{
    var result = null;

    if (container.containerID === searchedID)
    {
        result = container;
    }
    else
    {
        var subContainers = container.subContainers;

        for (var i = 0; i < subContainers.length; i++)
        {
            var subContainer = subContainers[i];
            var subContainerID = subContainer.containerID;
            var searchedSubID = searchedID.substring(0, subContainer.containerID.length);

            if (subContainerID === searchedSubID)
            {
                result = getContainerById(subContainer, searchedID);
                break;
            }
        }
    }
    return result;
};

/**
 * An attribute object to set properties of containers.
 * @constructor
 * @param {String} attributeName    - Name of the attribute
 * @param {Number} value            - Will normally a number but can be sth else (like boolean)
 * @param {String} unit             - The unit matching the value
 * @param {String} type             - Sets this attributes type (e.g. quantity or property)
 * @param {Boolean} compulsory      - True if items contained by this container must fulfill this requirement
 * @prop {String} attributeName    - Name of the attribute
 * @prop {Number} value            - Will normally a number but can be sth else (like boolean)
 * @prop {String} unit             - The unit matching the value
 * @prop {String} type             - Sets this attributes type (e.g. quantity or property)
 * @prop {Boolean} compulsory      - True if items contained by this container must fulfill this requirement
 * @author Marvin Therolf
 */
function ContainerAttribute(attributeName, value, unit, type, compulsory)
{
    this.attributeName = attributeName;
    this.value = value;
    this.unit = unit;
    this.type = type;
    this.compulsory = compulsory;
}

/**
 * A ContainerItem holds an ItemID as well as the amount of contained items of the id. For working with real items
 * there has to be a mapping process with the item data base. Directly storing items inside the container tree
 * structure would unnecessarily blow up the data structure and would be unhandy when trying to access the items
 * attributes outside of the container structure.
 * @constructor
 * @param {String} itemID           - ID of the contained item
 * @param {Number} amount           - Amount of items hold by the ContainerItem
 * @prop {String} itemID            - ID of the contained item
 * @prop {Number} amount            - Amount of items hold by the ContainerItem
 * @prop {String} parentContainerID - ID of the container that holds this ContainerItem
 * @author Marvin Therolf
 */
function ContainerItem(itemID, amount)
{
    this.itemID = itemID;
    this.amount = amount;
    this.parentContainerID = "0";
}

/**
 * Increases the amount of items held by a ContainerItem object by the given amount.
 * @function
 * @param {Container} containerItem     - ContainerItem the holds the item
 * @param {Number} amount               - Amount to add to the total amount
 * @author Marvin Therolf
 */
increaseAmount = function(containerItem, amount)
{
    containerItem.amount += amount;
};

/**
 * Decreases the amount of items held by a ContainerItem object by the given amount.
 * @function
 * @param {Container} containerItem     - ContainerItem the holds the item
 * @param {Number} amount               - Amount to sub from the total amount
 * @author Marvin Therolf
 */
decreaseAmount = function(containerItem, amount)
{
    containerItem.amount -= amount;
};

/**
 * This object holds the actual item objects stored in the database. Whenever it is necessary to work with the real
 * item data it is necessary to fetch the information from the database using the getDataItems function.
 * @constructor
 * @param {String} itemID           - Unique Identifier of the item
 * @param {String} itemName         - Name of the item
 * @prop {String} itemID            - Unique Identifier of the item
 * @prop {String} itemName          - Name of the item
 * @prop {Array} attributes         - Array of ItemAttributes
 * @author Marvin Therolf
 */
function Item(itemID, itemName)
{
    this.itemID = itemID;
    this.itemName = itemName;
    this.attributes = [];
}

/**
 * Adds an ItemAttribute object to the attributes array of a given item.
 * @function
 * @param {Item} item                   - Item to add the attribute to
 * @param {ItemAttribute} attribute     - Attribute to add to the item
 * @author Marvin Therolf
 */
addItemAttribute = function(item, attribute)
{
    item.attributes.push(attribute);
};

/**
 * Removes an ItemAttribute object from the attributes array of a given item.
 * @function
 * @param {Item} item                   - Item to remove the attribute from
 * @param {String} attributeName        - Name of the attribute to remove from the item
 * @author Marvin Therolf
 */
removeItemAttribute = function(item, attributeName)
{
    for (var i = 0; i < item.attributes.length; i++)
    {
        if (item.attributes[i].attributeName === attributeName)
        {
            removeFromArray(item.attributes, i);
            break;
        }
    }
};

/**
 * Removes all attributes from a given item.
 * @function
 * @param {Item} item       - Item to remove all attributes from
 * @author Marvin Therolf
 */
removeAllItemAttributes = function(item)
{
    item.attributes = [];
};

/**
 * An attribute object to set properties of items.
 * @constructor
 * @param {String} attributeName   - Name of the attribute
 * @param {Number} value           - Will normally a number but can be sth else (like boolean)
 * @param {String} unit            - The unit matching the value
 * @param {String} type            - Sets this attributes type (e.g. quantity or property)
 * @prop {String} attributeName    - Name of the attribute
 * @prop {Number} value            - Will normally a number but can be sth else (like boolean)
 * @prop {String} unit             - The unit matching the value
 * @prop {String} type             - Sets this attributes type (e.g. quantity or property)
 * @author Marvin Therolf
 */
function ItemAttribute(attributeName, value, unit, type)
{
    this.attributeName = attributeName;
    this.value = value;
    this.unit = unit;
    this.type = type;
}

/**
 * Function to quickly remove an object from an array by providing the array and the object's index.
 * @function
 * @param {Array} array     - Array to remove object from
 * @param index             - Index of the object to remove
 * @author Marvin Therolf
 */
var removeFromArray = function(array, index)
{
    var hold = array[index];
    array[index] = array[array.length-1];
    array[array.length-1] = hold;
    array.pop();
};

/**
 * Copies a given array and returns the copy.
 * @function
 * @param {Array} array - Original of the array to copy
 * @returns {Array} Copy of the given array.
 */
var copyArray = function(array)
{
    var result = [];

    for (var i = 0; i < array.length; i++)
    {
        result.push(array[i]);
    }
    return result;
};

/**
 * Helping function to compare two objects (numbers). Used in the sorting algorithm.
 * @param {Number} a    - A number
 * @param {Number} b    - Another number
 * @returns {number} The difference between a and b.
 */
var sortNumerically = function (a, b)
{
    return a - b;
};

// TODO: plausibility (already exists, etc.)
// TODO: rename CRUD operations (Marcel W.)
// TODO: what if I someone use an object which has been successfully removed from the data structure
// TODO: think about parent managing
// TODO: parent handling in container item
// TODO: scope (inklusive Doku-Annotations)
// TODO: exclude from misc => refresh all references???