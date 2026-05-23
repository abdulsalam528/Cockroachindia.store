const fs = require('fs');

let content = fs.readFileSync('src/app/admin/page.js', 'utf-8');

// 1. Add settings state
content = content.replace(
  `const [loadingProducts, setLoadingProducts] = useState(true);`,
  `const [loadingProducts, setLoadingProducts] = useState(true);\n  const [logisticsPartners, setLogisticsPartners] = useState([]);\n  const [loadingSettings, setLoadingSettings] = useState(true);`
);

// 2. Add fetchSettings
content = content.replace(
  `const [statusMessage, setStatusMessage] = useState('');`,
  `const [statusMessage, setStatusMessage] = useState('');\n\n  const fetchSettings = async () => {\n    setLoadingSettings(true);\n    try {\n      const res = await fetch('/api/admin/settings');\n      if (res.ok) {\n        const data = await res.json();\n        if (data.settings && data.settings.logisticsPartners) {\n          setLogisticsPartners(data.settings.logisticsPartners);\n        }\n      }\n    } catch (err) {\n      console.error('Failed to load settings:', err);\n    } finally {\n      setLoadingSettings(false);\n    }\n  };`
);

// 3. Update useEffect
content = content.replace(
  `        fetchOrders();\n        fetchProducts();\n      }, 0);`,
  `        fetchOrders();\n        fetchProducts();\n        fetchSettings();\n      }, 0);`
);

// 4. Update logistics save
content = content.replace(
  `        body: JSON.stringify({\n          orderId,\n          status: edit.status,\n          courierPartner: edit.courierPartner,\n          trackingId: edit.trackingId\n        })`,
  `        body: JSON.stringify({\n          orderId,\n          status: edit.status,\n          courierPartner: edit.courierPartner,\n          trackingId: edit.trackingId,\n          courierUrl: edit.courierPartner && logisticsPartners.find(p => p.name === edit.courierPartner)?.trackingUrlTemplate?.replace('{tracking_id}', edit.trackingId) || ''\n        })`
);

// 5. Add delete product handler
content = content.replace(
  `  const handleProductEditChange = (productId, field, value) => {`,
  `  const handleDeleteProduct = async (productId) => {\n    if (!window.confirm('WARNING: Are you sure you want to completely erase this product from the ledger? This cannot be undone.')) return;\n    setProductSaveLoading(prev => ({ ...prev, [productId]: true }));\n    try {\n      const res = await fetch(\`/api/admin/products?id=\${productId}\`, { method: 'DELETE' });\n      if (res.ok) {\n        setStatusMessage('Product eradicated successfully.');\n        setTimeout(() => setStatusMessage(''), 4000);\n        fetchProducts();\n      } else {\n        const data = await res.json();\n        alert(data.error || 'Failed to delete product.');\n      }\n    } catch (err) {\n      alert(err.message);\n    } finally {\n      setProductSaveLoading(prev => ({ ...prev, [productId]: false }));\n    }\n  };\n\n  const handleProductEditChange = (productId, field, value) => {`
);

// 6. Update Tabs
content = content.replace(
  `            Inventory Monitor\n          </button>\n        </div>`,
  `            Inventory Monitor\n          </button>\n          <button\n            onClick={() => setActiveTab('settings')}\n            className={\`px-4 py-2 text-xs font-bold uppercase transition-colors cursor-pointer \${\n              activeTab === 'settings' ? 'bg-black text-[#EAE5D9]' : 'bg-[#EAE5D9] text-black hover:bg-gray-200'\n            }\`}\n          >\n            System Settings\n          </button>\n        </div>`
);

// 7. Update order courier dropdown
content = content.replace(
  `<option value="">Unassigned</option>\n                          <option value="Delhivery">Delhivery</option>\n                          <option value="BlueDart">BlueDart</option>\n                          <option value="Shiprocket">Shiprocket</option>\n                          <option value="India Post">India Post</option>`,
  `<option value="">Unassigned</option>\n                          {logisticsPartners.map((lp, idx) => (\n                            <option key={idx} value={lp.name}>{lp.name}</option>\n                          ))}`
);

// 8. Add settings tab at the end of the file
const settingsTab = `
      {/* TAB 3: System Settings */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h3 className="font-display text-xl uppercase font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C2410C]" />
              Global Settings Configuration
            </h3>
            <button
              onClick={fetchSettings}
              className="border-2 border-black bg-white p-1.5 hover:bg-gray-100 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Sync
            </button>
          </div>
          
          <div className="border-4 border-black p-6 bg-[#EAE5D9] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-display font-black uppercase text-lg mb-2">Logistics Partners Configuration</h4>
            <p className="text-xs font-bold text-gray-600 mb-6">Add courier partners and their tracking URL formats. Use <code>{'{tracking_id}'}</code> where the tracking number should go.</p>
            
            <div className="flex flex-col gap-4">
              {logisticsPartners.map((partner, idx) => (
                <div key={idx} className="flex gap-4 items-end border border-black/20 p-3 bg-white">
                  <div className="flex flex-col gap-1 flex-grow">
                    <label className="text-[10px] font-bold uppercase text-gray-600">Partner Name</label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => {
                        const newPartners = [...logisticsPartners];
                        newPartners[idx].name = e.target.value;
                        setLogisticsPartners(newPartners);
                      }}
                      className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs"
                      placeholder="e.g. Delhivery"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-grow-[2]">
                    <label className="text-[10px] font-bold uppercase text-gray-600">Tracking URL Template</label>
                    <input
                      type="text"
                      value={partner.trackingUrlTemplate}
                      onChange={(e) => {
                        const newPartners = [...logisticsPartners];
                        newPartners[idx].trackingUrlTemplate = e.target.value;
                        setLogisticsPartners(newPartners);
                      }}
                      className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs"
                      placeholder="e.g. https://www.delhivery.com/track/package/{tracking_id}"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newPartners = logisticsPartners.filter((_, i) => i !== idx);
                      setLogisticsPartners(newPartners);
                    }}
                    className="bg-red-600 text-white border border-black px-3 py-1 font-bold text-xs uppercase hover:bg-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setLogisticsPartners([...logisticsPartners, { name: '', trackingUrlTemplate: '' }])}
                className="self-start bg-black text-white px-4 py-2 text-xs font-bold uppercase mt-2 hover:bg-gray-800 border-2 border-transparent"
              >
                + Add Logistics Partner
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/settings', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ logisticsPartners })
                    });
                    if (res.ok) {
                      setStatusMessage('Settings updated successfully.');
                      setTimeout(() => setStatusMessage(''), 4000);
                    }
                  } catch (e) {
                    alert('Error saving settings');
                  }
                }}
                className="w-full bg-[#C2410C] text-white border-2 border-black font-display font-black uppercase text-xs py-3 mt-4 hover:bg-black transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(
  `    </div>\n  );\n}`,
  settingsTab
);

fs.writeFileSync('src/app/admin/page.js', content, 'utf-8');
console.log('Successfully updated src/app/admin/page.js');
