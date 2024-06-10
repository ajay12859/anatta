const args = process.argv.slice(2);
console.log(args);
if (!args?.length) {
    throw Error("Invalid arguments");
}

let productquery = "";
if(args[0]=="--name" && args[1]) productquery = args[1];

const url = "https://anatta-test-store.myshopify.com/admin/api/2024-04/graphql.json";

const productsQuery = {
    operationName: "Query",
    query: `
        query Query($query: String) {
            products(query: $query, first: 10) {
                edges {
                    node {
                        id
                        title
                        variants(first:5) {
                            edges {
                                node {
                                    title
                                    price
                                }
                            }
                        }
                    }
                }
            }
        }
    `,
    variables: { "query": productquery }
    
}

function flattenProducts(products) {
    let prods = [];
    for(let prod of products.edges) {

        for(let variant of prod.node.variants.edges) {
            const p = {
                title: prod.node.title,
                variant: variant.node.title,
                price: variant.node.price
            }
            prods.push(p);
        }

    }
    prods.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    return prods;
}

fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "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"
    },
    body: JSON.stringify(productsQuery)
})
.then(res=>res.json())
.then(response=>{
    // console.log("response\n",response)
    const products = response?.data?.products;
    if(products) {
        if(!products?.edges?.length) {
            console.log("No results");
        }
        else {
            // console.log(JSON.stringify(products));
            const listOfProducts = flattenProducts(products);
            
            console.table(listOfProducts);
        }
        
    }
    // else if(response['errors']) {
    //     console.log("Error fetching products")
    // }
    else {
        console.log("Error fetching products")
    }

})
.catch(error=> {
    console.error("Error",error );
})