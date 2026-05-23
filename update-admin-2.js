const fs = require('fs');

let content = fs.readFileSync('src/app/admin/page.js', 'utf-8');

const variantsEditorReplacement = `                      {/* Dynamic Variants Editor */}
                      <div className="flex flex-col gap-2 border-t border-black/10 pt-3">
                        <span className="uppercase text-gray-500 font-bold text-[10px]">Product Variants (Colors & Sizes)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {edit.variants && edit.variants.map((v, vIdx) => (
                            <div key={vIdx} className="flex flex-col gap-1 border-2 border-black/20 p-2 bg-white relative">
                              <button 
                                onClick={() => {
                                  const newVariants = [...edit.variants];
                                  newVariants.splice(vIdx, 1);
                                  handleProductEditChange(product.id, 'variants', newVariants);
                                }}
                                className="absolute top-1 right-1 text-red-600 font-bold hover:text-red-800"
                                title="Remove Variant"
                              >×</button>
                              
                              <label className="text-[9px] font-bold uppercase text-gray-500">Color</label>
                              <input 
                                type="text" 
                                value={v.color} 
                                onChange={(e) => {
                                  const newVariants = [...edit.variants];
                                  newVariants[vIdx].color = e.target.value;
                                  handleProductEditChange(product.id, 'variants', newVariants);
                                }}
                                className="border border-black bg-white px-1.5 py-0.5 font-bold outline-none text-xs"
                              />

                              <div className="flex gap-2">
                                <div className="flex flex-col flex-grow">
                                  <label className="text-[9px] font-bold uppercase text-gray-500">Size</label>
                                  <select 
                                    value={v.size}
                                    onChange={(e) => {
                                      const newVariants = [...edit.variants];
                                      newVariants[vIdx].size = e.target.value;
                                      handleProductEditChange(product.id, 'variants', newVariants);
                                    }}
                                    className="border border-black bg-white px-1 py-0.5 font-bold outline-none text-xs"
                                  >
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                  </select>
                                </div>
                                <div className="flex flex-col flex-grow">
                                  <label className="text-[9px] font-bold uppercase text-gray-500">Stock</label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={v.stock}
                                    onChange={(e) => {
                                      const newVariants = [...edit.variants];
                                      newVariants[vIdx].stock = Number(e.target.value);
                                      handleProductEditChange(product.id, 'variants', newVariants);
                                    }}
                                    className="border border-black bg-white px-1 py-0.5 font-bold outline-none text-xs w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newVariants = [...(edit.variants || [])];
                            newVariants.push({ color: 'Default', size: 'M', stock: 0 });
                            handleProductEditChange(product.id, 'variants', newVariants);
                          }}
                          className="self-start text-[10px] bg-black text-white px-2 py-1 uppercase font-bold hover:bg-gray-800"
                        >
                          + Add Variant
                        </button>
                      </div>

                      {/* Fallback Legacy Stock Inputs (only if variants array is empty) */}
                      {(!edit.variants || edit.variants.length === 0) && (
                        <div className="flex flex-col gap-1.5 border-t border-black/10 pt-2 mt-2">
                          <span className="uppercase text-gray-500 font-bold text-[10px]">Legacy Bulk Stock:</span>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">S</span>
                              <input type="number" min="0" value={edit.sizeS} onChange={(e) => handleProductEditChange(product.id, 'sizeS', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">M</span>
                              <input type="number" min="0" value={edit.sizeM} onChange={(e) => handleProductEditChange(product.id, 'sizeM', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">L</span>
                              <input type="number" min="0" value={edit.sizeL} onChange={(e) => handleProductEditChange(product.id, 'sizeL', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">XL</span>
                              <input type="number" min="0" value={edit.sizeXL} onChange={(e) => handleProductEditChange(product.id, 'sizeXL', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                          </div>
                        </div>
                      )}`;

const legacyStockSectionRegex = /\{\/\* Stock adjustments \(Grouped by variant color\/size if they exist, or standard size inputs\) \*\/\}(.|\n)*?<\/div>\n\s*<\/div>\n\s*\)\s*:\s*\((.|\n)*?<\/div>\n\s*\)\}/gm;

if (content.match(legacyStockSectionRegex)) {
  content = content.replace(legacyStockSectionRegex, variantsEditorReplacement);
} else {
  console.log("Could not find legacy stock section regex match!");
}

const buttonsReplacement = `                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateProduct(product.id)}
                          disabled={productSaveLoading[product.id]}
                          className="bg-black text-[#EAE5D9] border-2 border-black p-2 flex items-center justify-center gap-2 hover:bg-[#C2410C] hover:text-white transition-colors cursor-pointer w-full text-xs font-bold uppercase tracking-wider mt-2"
                        >
                          {productSaveLoading[product.id] ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <><Save className="w-4 h-4" /> Save Ledger Adjustment</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={productSaveLoading[product.id]}
                          className="bg-red-600 text-white border-2 border-black px-4 flex items-center justify-center hover:bg-red-800 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider mt-2"
                          title="Delete Product"
                        >
                          Delete
                        </button>
                      </div>`;

const oldSaveButtonRegex = /<button\s*onClick=\{\(\) => handleUpdateProduct\(product.id\)\}(.|\n)*?<\/button>/gm;
content = content.replace(oldSaveButtonRegex, buttonsReplacement);

fs.writeFileSync('src/app/admin/page.js', content, 'utf-8');
console.log('Successfully updated src/app/admin/page.js');
