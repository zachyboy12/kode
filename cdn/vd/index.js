let context = {};


String.prototype.formatVD = function(context) {
    let text = this;
    let vElementsUsed = [];
    for (let attribute in context) {
        text = text.split('{{' + attribute + '}}').join(context[attribute]);
        vElementsUsed.push(attribute);
    }
    return [text, vElementsUsed];
}


document.addEventListener("DOMContentLoaded", (_) => {
    let children = Array.from(document.body.getElementsByTagName("*"));
    for (let element in children) {
        if (children[element].hasAttribute("id")) {
            let id = children[element].id;
            context[id] = children[element].value || children[element].innerText;
            window[id] = children[element];
            if (window[`${id}Handler`] !== undefined) {
                let handlerScopeString = JSON.stringify(window[`${id}Handler`](children[element]));
                let handlerScope;
                try {
                    handlerScope = JSON.parse(handlerScopeString);
                } catch (error) {
                    if (error instanceof SyntaxError) {
                        throw Error("You didn't return the scope!");
                    } else {
                        throw error;
                    }
                }
                context[`${id}Scope`] = handlerScopeString;
                for (let scopeVariable in handlerScope) {
                    context[`${id}Scope.${scopeVariable}`] = handlerScope[scopeVariable];
                    context[`viewer_${id}Scope.${scopeVariable}`] = JSON.stringify(handlerScope[scopeVariable]);
                }
            }
        }
        let formattedObject = children[element].innerText.formatVD(context);
        let originalText = children[element].innerText;
        children[element].innerText = formattedObject[0];
        children[element].value = formattedObject[0];
        if (formattedObject[1].length !== 0) {
            // It used something from allElements[]
            const usedObjects = formattedObject[1];
            for (let usedObject in usedObjects) {
                let usedElement = document.getElementById(usedObjects[usedObject]);
                if (usedElement === null) {
                    // if (!children[element].hasAttribute(`${usedObjects[usedObject]}-update`)) {
                    //     continue;
                    // }
                    // let updateObject = JSON.parse("{" + children[element].getAttribute(`${usedObjects[usedObject]}-update`) + "}");
                    // let callback = window[children[element].getAttribute(`${usedObjects[usedObject]}-updater`)];
                    // for (let updateObjectElementId in updateObject) {
                    //     let updateObjectElement = document.getElementById(updateObjectElementId);
                    //     updateObjectElement.addEventListener(updateObject[updateObjectElementId], event => {
                    //         let newScope = callback(context[`${usedObjects[usedObject]}`], event);
                    //         console.log(context);
                    //         context[`${usedObjects[usedObject]}`] = newScope;
                    //         for (let newScopeVariable in newScope) {
                    //             context[newScopeVariable] = newScope[newScopeVariable];
                    //         }
                    //     });
                    // }
                    continue;
                }
                let updateEvents = children[element].getAttribute(`${usedObjects[usedObject]}-update`);
                let defaultText = children[element].getAttribute(`${usedObjects[usedObject]}-default`);
                if (updateEvents) {
                    updateEvents = updateEvents.replaceAll(" ", "").split(",");
                    for (let updateEvent in updateEvents) {
                        usedElement.addEventListener(updateEvents[updateEvent], (event) => {
                            for (let elementId in context) {
                                try {
                                    context[elementId] = document.getElementById(elementId);
                                    context[elementId] = context[elementId].value || context[elementId].innerText;
                                } catch {
                                    
                                }
                            }
                            //children[element].outerHTML = originalText.formatVD(allElements)[0];
                            children[element].innerText = originalText.formatVD(context)[0];
                            children[element].value = originalText.formatVD(context)[0];
                        });
                    }
                }
                if (defaultText) {
                    context[usedObjects[usedObject]] = defaultText;
                    children[element].innerText = originalText.formatVD(context)[0];
                    children[element].value = originalText.formatVD(context)[0];
                }
            }
        }
    }
});
