const xDistance = 120;
const yDistance = 150;

function makeDetailsHeader(type, name) {
  return $('<h3>').addClass('details-header')
  .append($('<span>').addClass('details-header-type').text(`${type}: `))
  .append($('<span>').addClass('details-header-name').text(name))
}

function showPluginDetails(node, detailsDiv) {
  const { plugin_name: pluginName, plugin_args: pluginArgs } = node.data('meta');
  const header = makeDetailsHeader('Plugin', pluginName); //$('<h3>').text(`Plugin: ${pluginName}`);

  const argsTbl = $('<table>').addClass('plugin-args');
  Object.keys(pluginArgs).forEach(argName => {
    argValue = pluginArgs[argName];
    const argRow = $('<tr>')
    .append($('<td>').text(argName).addClass('plugin-arg-name'))
    .append($('<td>').text('=>').addClass('plugin-arg-name'))
    .append($('<td>').text(argValue));
    argsTbl.append(argRow);
  });

  detailsDiv.html(header).append(argsTbl);
  detailsDiv.show();
}

function showIfDetails(node, detailsDiv) {
  const { condition } = node.data('meta');

  function operandToStr(operand, depth) {
    if (Array.isArray(operand)) {
      return `${exprTreeToStr(operand, depth)}`;
    }
    return operand;
  }

  function exprTreeToStr(exprTree, depth = 0) {
    const operator = exprTree[0];
    if (exprTree.length === 2) {
      const rightOperand = operandToStr(exprTree[1], depth + 1);
      return `${operator}(${rightOperand})`;
    } else if (exprTree.length === 3) {
      const leftOperand = operandToStr(exprTree[1], depth + 1);
      const rightOperand = operandToStr(exprTree[2], depth + 1);
      const exprStr = `${leftOperand} ${operator} ${rightOperand}`;
      return (depth === 0) ? exprStr : `(${exprStr})`;
    }
  }

  const header = makeDetailsHeader('Conditional', 'if');
  const exprDiv = $('<div>').addClass('conditional-expr').html(exprTreeToStr(condition));

  detailsDiv.html(header).append(exprDiv);
  detailsDiv.show();
}

function handleUnknownNodeTypeDetails(node, detailsDiv) {
  detailsDiv.hide();
}

function convertApiResponsetoCYElements(apiResponse, cy) {

  let filterInNodeId, filterOutNode;
  apiResponse.filter.vertices.forEach(vertex => {

    if (vertex.name === 'filter_in') {
      filterInNodeId = vertex.id;
    }

    const node = cy.add({
      group: 'nodes',
      data: {
        id: vertex.id,
        label: vertex.name === 'plugin' ? vertex.meta.plugin_name : vertex.name,
        name: vertex.name,
        meta: vertex.meta,
        shape: 'roundrectangle'
      }
    });

    if (vertex.name === 'if') {
      node.data('shape', 'diamond');
    }

    if (vertex.name === 'filter_out') {
      filterOutNode = node;
    }

  });

  apiResponse.filter.edges.forEach(edge => {
    cy.add({
      group: 'edges',
      data: {
        id: edge.id,
        source: edge.from_vertex,
        target: edge.to_vertex,
        meta: edge.meta,
        label: edge.meta.boolean
      }
    });
  });

  // cy.layout({
  //   name: 'breadthfirst',
  //   directed: true
  // });

  let maxX = 0;
  let maxY = 0;
  cy.elements().bfs({
    roots: '#' + filterInNodeId,
    visit(i, depth, currentNode, previousToCurrentEdge, previousNode) {
      const position = { x: xDistance, y: yDistance };
      if (previousNode) {
        if (previousNode.data('name') === 'if') {
          if (previousToCurrentEdge.data('meta').boolean === 'true') {
            position.x = previousNode.position('x') + xDistance;
            position.y = previousNode.position('y');
          } else {
            position.x = previousNode.position('x');
            position.y = previousNode.position('y') + yDistance;
          }
        } else {
          position.x = previousNode.position('x') + xDistance;
          position.y = previousNode.position('y');
        }
      }
      currentNode.position(position);
      maxX = Math.max(maxX, position.x);
      maxY = Math.max(maxY, position.y);

      filterOutNode.position({
        x: maxX,
        y: maxY
      });
    },
    directed: true
  });

  cy.on('mouseover', 'node', e => {
    const node = e.cyTarget;
    const nodeType = node.data('name');
    const detailsDiv = $('#details');

    switch(nodeType) {
      case 'plugin':
        showPluginDetails(node, detailsDiv);
        break;
      case 'if': {
        showIfDetails(node, detailsDiv);
        break;
      }
      default:
        handleUnknownNodeTypeDetails(node, detailsDiv);
    }
  });

  cy.fit();

}

const apiResponse = {
   "format":"LogstashLSI",
   "version":"0.0.0",
   "filter":{
      "edges":[
         {
            "id":"a7c20eff-7542-4024-bb2c-c7664c00f7b1",
            "meta":{

            },
            "from_vertex":"f8e503ea-5de7-4b4f-823d-77bd26d4e892",
            "to_vertex":"95dab9cb-130b-46f2-a211-1c3d924c5a04"
         },
         {
            "id":"def7da52-83be-40ec-8204-b1e423ac52c3",
            "meta":{
               "boolean":"true"
            },
            "from_vertex":"95dab9cb-130b-46f2-a211-1c3d924c5a04",
            "to_vertex":"77308323-15f9-4b9a-a0ca-04a3382a2d24"
         },
         {
            "id":"bd73cda4-0820-4d4d-a4ca-085b6a87e3aa",
            "meta":{

            },
            "from_vertex":"77308323-15f9-4b9a-a0ca-04a3382a2d24",
            "to_vertex":"f711eadf-b49f-4143-8b41-18a8d24a8199"
         },
         {
            "id":"cfb4309d-32c2-4a94-9c84-2a03189719c4",
            "meta":{

            },
            "from_vertex":"f711eadf-b49f-4143-8b41-18a8d24a8199",
            "to_vertex":"4de81c7c-aa46-489d-9224-344bdc8a1cb4"
         },
         {
            "id":"a645e511-137f-4fb9-a674-dbbd997d84b2",
            "meta":{
               "boolean":"true"
            },
            "from_vertex":"4de81c7c-aa46-489d-9224-344bdc8a1cb4",
            "to_vertex":"2ba5cfe8-52a3-4d30-b999-f8f7f7cbc7cf"
         },
         {
            "id":"37b668f9-ed38-4801-bda3-62c533f8108d",
            "meta":{

            },
            "from_vertex":"2ba5cfe8-52a3-4d30-b999-f8f7f7cbc7cf",
            "to_vertex":"916d3093-37c5-47e8-8c71-601dafdd8b16"
         },
         {
            "id":"11800c50-d982-4880-9471-36ad1bdcb717",
            "meta":{
               "boolean":"false"
            },
            "from_vertex":"4de81c7c-aa46-489d-9224-344bdc8a1cb4",
            "to_vertex":"66f38667-532c-496a-a0dc-f398ee02935e"
         },
         {
            "id":"8d1ce2dd-76cf-42e3-a94b-531196b30397",
            "meta":{

            },
            "from_vertex":"66f38667-532c-496a-a0dc-f398ee02935e",
            "to_vertex":"916d3093-37c5-47e8-8c71-601dafdd8b16"
         },
         {
            "id":"044fa685-7b3f-462a-82c9-32c3a1f8d17e",
            "meta":{
               "boolean":"false"
            },
            "from_vertex":"95dab9cb-130b-46f2-a211-1c3d924c5a04",
            "to_vertex":"12638cc0-9a8d-49f4-aac2-2518198589fd"
         },
         {
            "id":"3afa6dee-9cb3-4a72-b0f8-00c0099e997f",
            "meta":{
               "boolean":"true"
            },
            "from_vertex":"12638cc0-9a8d-49f4-aac2-2518198589fd",
            "to_vertex":"18eb63dc-c365-4427-b564-f8ebce3b3a2e"
         },
         {
            "id":"02b4b720-8dd1-4dff-a3d3-91bb19537ef2",
            "meta":{

            },
            "from_vertex":"18eb63dc-c365-4427-b564-f8ebce3b3a2e",
            "to_vertex":"916d3093-37c5-47e8-8c71-601dafdd8b16"
         },
         {
            "id":"57ad6bb0-b98a-4fee-a03f-4a136f41340f",
            "meta":{
               "boolean":"false"
            },
            "from_vertex":"12638cc0-9a8d-49f4-aac2-2518198589fd",
            "to_vertex":"dcce4584-db2d-46ec-9f4c-1aa466a63a4b"
         },
         {
            "id":"6d380e47-b511-426b-9904-3011caa33465",
            "meta":{
               "boolean":"true"
            },
            "from_vertex":"dcce4584-db2d-46ec-9f4c-1aa466a63a4b",
            "to_vertex":"ea3ea848-cff4-4f38-8c72-5c8e7cca6713"
         },
         {
            "id":"c6e021a7-8720-48ae-9200-9603b02fd9ab",
            "meta":{

            },
            "from_vertex":"ea3ea848-cff4-4f38-8c72-5c8e7cca6713",
            "to_vertex":"916d3093-37c5-47e8-8c71-601dafdd8b16"
         },
         {
            "id":"105ca5c9-fe9d-48b8-8f68-20a622e43443",
            "meta":{
               "boolean":"false"
            },
            "from_vertex":"dcce4584-db2d-46ec-9f4c-1aa466a63a4b",
            "to_vertex":"00e85760-a976-472a-b3ed-dbdefcf208fe"
         },
         {
            "id":"be9415f9-feb5-4953-b4cb-6102f3e6dba4",
            "meta":{

            },
            "from_vertex":"00e85760-a976-472a-b3ed-dbdefcf208fe",
            "to_vertex":"916d3093-37c5-47e8-8c71-601dafdd8b16"
         }
      ],
      "vertices":[
         {
            "id":"f8e503ea-5de7-4b4f-823d-77bd26d4e892",
            "name":"filter_in",
            "meta":{
               "uuid":"90354acb-4a4a-419c-8b3c-3c388640c178"
            }
         },
         {
            "id":"95dab9cb-130b-46f2-a211-1c3d924c5a04",
            "name":"if",
            "meta":{
               "uuid":"2bb92ff4-3f2e-48c4-8c82-15a40cb59551",
               "condition":[
                  "==",
                  [
                     "get",
                     "[type]"
                  ],
                  "hostbytes"
               ]
            }
         },
         {
            "id":"77308323-15f9-4b9a-a0ca-04a3382a2d24",
            "name":"plugin",
            "meta":{
               "uuid":"e41ccd24-778e-47e6-903f-32cc6b2ed0b2",
               "plugin_name":"grok",
               "plugin_args":{
                  "match":"{ data => \"%{WORD:hostname} %{NUMBER:bytes}\" }"
               }
            }
         },
         {
            "id":"f711eadf-b49f-4143-8b41-18a8d24a8199",
            "name":"plugin",
            "meta":{
               "uuid":"b91e0b9b-e7b2-448b-af90-b656272ac782",
               "plugin_name":"mutate",
               "plugin_args":{
                  "lowercase":"[\"hostname\"]"
               }
            }
         },
         {
            "id":"4de81c7c-aa46-489d-9224-344bdc8a1cb4",
            "name":"if",
            "meta":{
               "uuid":"be8d2154-4003-4906-beab-490c37bdcec9",
               "condition":[
                  "or",
                  [
                     "and",
                     [
                        "!=",
                        [
                           "get",
                           "[hostname]"
                        ],
                        "localhost"
                     ],
                     [
                        "!=",
                        [
                           "get",
                           "[hostname]"
                        ],
                        "127.0.0.1"
                     ]
                  ],
                  [
                     "==",
                     [
                        "get",
                        "[hostname]"
                     ],
                     "special"
                  ]
               ]
            }
         },
         {
            "id":"2ba5cfe8-52a3-4d30-b999-f8f7f7cbc7cf",
            "name":"plugin",
            "meta":{
               "uuid":"0056c2a3-6684-4c11-8c44-29fbd6505a52",
               "plugin_name":"mutate",
               "plugin_args":{
                  "add_field":"{\"notlocalhost\" => \"true\"}"
               }
            }
         },
         {
            "id":"916d3093-37c5-47e8-8c71-601dafdd8b16",
            "name":"filter_out",
            "meta":{
               "uuid":"0206d967-1a79-49c6-b58a-5303c2f2fbbd"
            }
         },
         {
            "id":"66f38667-532c-496a-a0dc-f398ee02935e",
            "name":"plugin",
            "meta":{
               "uuid":"e004cae8-4274-45b2-865a-083eb6fd1ecf",
               "plugin_name":"drop",
               "plugin_args":{

               }
            }
         },
         {
            "id":"12638cc0-9a8d-49f4-aac2-2518198589fd",
            "name":"if",
            "meta":{
               "uuid":"aa14ab05-3576-4d78-b780-425b16cd33ac",
               "condition":[
                  "==",
                  [
                     "get",
                     "[type]"
                  ],
                  "crazy"
               ]
            }
         },
         {
            "id":"18eb63dc-c365-4427-b564-f8ebce3b3a2e",
            "name":"plugin",
            "meta":{
               "uuid":"739429f1-4acf-480a-a6c6-d71073e670f1",
               "plugin_name":"mutate",
               "plugin_args":{
                  "add_tag":"\"thisiscrazy\""
               }
            }
         },
         {
            "id":"dcce4584-db2d-46ec-9f4c-1aa466a63a4b",
            "name":"if",
            "meta":{
               "uuid":"2f4a7af5-8a2b-49fa-b907-a037798edb3b",
               "condition":[
                  "==",
                  [
                     "get",
                     "[type]"
                  ],
                  "sane"
               ]
            }
         },
         {
            "id":"ea3ea848-cff4-4f38-8c72-5c8e7cca6713",
            "name":"plugin",
            "meta":{
               "uuid":"92945d02-b2d5-41b9-b9be-4ff994cc8065",
               "plugin_name":"mutate",
               "plugin_args":{
                  "add_tag":"\"thisissane\""
               }
            }
         },
         {
            "id":"00e85760-a976-472a-b3ed-dbdefcf208fe",
            "name":"plugin",
            "meta":{
               "uuid":"cf8bf789-da5a-4eda-8b2a-2ec250a31531",
               "plugin_name":"drop",
               "plugin_args":{

               }
            }
         }
      ]
   }
};

const cy = cytoscape({

  container: document.getElementById('cy'), // container to render in
  style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'shape': 'data(shape)',
        'content': 'data(label)',
        'text-valign': 'center',
        'color': 'white',
        'text-outline-width': 2,
        'background-color': '#6FB1FC',
        'text-outline-color': '#6FB1FC',
        'height': 'label',
        'width': 'label',
        'padding-left': 10,
        'padding-right': 10,
        'padding-top': 10,
        'padding-bottom': 10,
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'mid-target-arrow-color': '#000',
        'mid-target-arrow-shape': 'triangle',
        'mid-target-arrow-fill': 'filled',
        'source-label': 'data(label)',
        'source-text-offset': 32,
        'text-valign': 'center',
        'color': 'white',
        'text-outline-color': '#6FB1FC',
        'text-outline-width': 2,
      }
    }

  ]

});

convertApiResponsetoCYElements(apiResponse, cy);
