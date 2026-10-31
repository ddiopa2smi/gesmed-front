import { Checkbox, Flex, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react'
import "./DataTable.scss"

function DataTable({
    title,
    dataSource,
    dataSourceCopy,
    tableLoading,
    rowKey,
    columns,
    rowSelected,
    pagination,
    components,
    selectedRowKeys = [],
    setSelectedRowKeys,
    getCheckboxProps,
    rowClassName,
    summary,
    scroll,
    compact,
    onTableChange,
    totalCount,
    // Événements de ligne transmis tels quels à la Table AntD (clic, double-clic...)
    onRow,
    // Masque le compteur "N ligne(s) au total" (quand la page affiche déjà ses propres totaux)
    hideTotal = false
}) {

    // Contient les lignes issues de dataSourceCopy après application des filtres/tri
    // internes d'AntD (extra.currentDataSource), càd les données "actuelles" affichées
    // à l'écran, toutes pages confondues. null tant qu'aucun filtre/tri n'a encore été
    // déclenché, auquel cas on retombe sur dataSourceCopy en intégralité.
    const [currentDataSource, setCurrentDataSource] = useState(null);
    const [sortedInfo, setSortedInfo] = useState({});

    // Réinitialise la donnée "filtrée" suivie quand la donnée source change (recherche,
    // période, rafraîchissement...) pour ne pas rester bloqué sur un jeu de données obsolète
    // tant qu'aucun filtre n'a encore été réappliqué sur le nouveau jeu de données.
    useEffect(() => {
        setCurrentDataSource(null);
    }, [dataSourceCopy]);

    const tableCount = currentDataSource !== null ? currentDataSource.length : (dataSourceCopy?.length || 0);
    // Un filtre de colonne réduit le nombre de lignes affichées (un simple tri ne le change pas)
    const isColumnFiltered = currentDataSource !== null && currentDataSource.length !== (dataSourceCopy?.length || 0);

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const getRecordKey = (record) =>
        typeof rowKey === 'function' ? rowKey(record) : record?.[rowKey || 'key'];

    // Lignes actuellement affichées (données filtrées le cas échéant), toutes pages
    // confondues, en excluant celles rendues non sélectionnables via getCheckboxProps.
    const selectableKeysInView = (currentDataSource !== null ? currentDataSource : (dataSourceCopy || []))
        .filter((record) => !(getCheckboxProps?.(record)?.disabled))
        .map(getRecordKey);

    const allSelectedInView = selectableKeysInView.length > 0 && selectableKeysInView.every((key) => selectedRowKeys.includes(key));
    const someSelectedInView = selectableKeysInView.some((key) => selectedRowKeys.includes(key));

    // Remplace la case à cocher d'en-tête par défaut d'AntD (qui ne sélectionne que la
    // page courante) par une case contrôlée qui sélectionne/désélectionne toutes les
    // lignes actuellement affichées (filtrées le cas échéant), toutes pages confondues.
    const headerCheckbox = (
        <Checkbox
            checked={allSelectedInView}
            indeterminate={!allSelectedInView && someSelectedInView}
            onChange={(e) => {
                if (e.target.checked) {
                    setSelectedRowKeys(Array.from(new Set([...selectedRowKeys, ...selectableKeysInView])));
                } else {
                    const toRemove = new Set(selectableKeysInView);
                    setSelectedRowKeys(selectedRowKeys.filter((key) => !toRemove.has(key)));
                }
            }}
        />
    );

    // Note : columnTitle remplace entièrement le contenu de la cellule d'en-tête (case à
    // cocher + dropdown natif), donc l'option "selections" (SELECTION_ALL/INVERT/NONE) n'a
    // plus d'effet ici et a été retirée.
    let rowSelection = {
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: getCheckboxProps,
        columnTitle: headerCheckbox,
    };
    return (
        <Table
            title={hideTotal && !title && !isColumnFiltered ? undefined : () => (
                <Flex justify="space-between" align="center">
                    <span>{title}</span>
                    {!hideTotal && <span>{`${totalCount !== undefined ? totalCount : tableCount} ligne(s) au total`}</span>}
                    {hideTotal && isColumnFiltered && (
                        <Tag color="processing" style={{ marginInlineEnd: 0 }}>
                            {`${tableCount} ligne(s) sur ${dataSourceCopy?.length || 0} (filtre de colonne actif)`}
                        </Tag>
                    )}
                </Flex>
            )}
            onChange={(pagination, filters, sorter, extra) => {
                setCurrentDataSource(extra.currentDataSource);
                //setFilteredInfo(filters);
                setSortedInfo(sorter);
                if (onTableChange) {
                    onTableChange(pagination, filters, sorter, extra);
                }
            }}
            rowSelection={rowSelected && rowSelection}
            columns={columns}
            loading={tableLoading}
            dataSource={dataSourceCopy}
            rowKey={rowKey}
            size="small"
            scroll={scroll === null ? undefined : (scroll || { x: "max-content" })}
            className={compact ? "compact-table" : undefined}
            rowClassName={rowClassName}
            onRow={onRow}
            components={components}
            pagination={pagination}
            summary={summary}
            footer={selectedRowKeys?.length !== 0 ? () => `${selectedRowKeys?.length}/${dataSourceCopy.length} ligne(s) sélectionné(es)` : undefined}
        />
    )
}

export default DataTable