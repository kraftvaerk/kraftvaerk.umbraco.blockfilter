using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using kraftvaerk.umbraco.blockfilter.Backend.Models;
using Umbraco.Cms.Core.Notifications;

namespace kraftvaerk.umbraco.blockfilter.Backend.Notifications;
public class RemodelBlockCatalogueNotification : ICancelableNotification
{
    private BlockCatalogueModel _model;
    public RemodelBlockCatalogueNotification(BlockCatalogueModel model)
    {
        _model = model;
    }

    public BlockCatalogueModel Model
    {
        get => _model;
        set => _model = value;
    }
    public bool Cancel { get; set; }
}
