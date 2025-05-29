import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatarMoeda } from '../utils/format';

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

interface Cliente {
  nome: string;
  cnpj: string;
  endereco: string;
}

interface PedidoPDFProps {
  numeroPedido: string;
  cliente: Cliente;
  produtos: Produto[];
  valorTotal: number;
  dataPedido: string;
  dataPrevisao: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  table: {
    display: 'table' as any,
    width: '100%',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
  },
  quantidadeCell: {
    flex: 0.5,
    textAlign: 'center',
  },
  valorCell: {
    flex: 0.8,
    textAlign: 'right',
  },
  total: {
    marginTop: 10,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

const PedidoPDF: React.FC<PedidoPDFProps> = ({
  numeroPedido,
  cliente,
  produtos,
  valorTotal,
  dataPedido,
  dataPrevisao,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Resumo do Pedido #{numeroPedido}</Text>
        <Text style={styles.subtitle}>Data do Pedido: {new Date(dataPedido).toLocaleDateString()}</Text>
        <Text style={styles.subtitle}>Previsão de Entrega: {new Date(dataPrevisao).toLocaleDateString()}</Text>
      </View>

      {/* Dados do Cliente */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Dados do Cliente</Text>
        <Text>{cliente.nome}</Text>
        <Text>CNPJ: {cliente.cnpj}</Text>
        <Text>Endereço: {cliente.endereco}</Text>
      </View>

      {/* Tabela de Produtos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Produtos</Text>
        <View style={styles.table}>
          {/* Cabeçalho da Tabela */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Produto</Text>
            <Text style={styles.quantidadeCell}>Qtd</Text>
            <Text style={styles.valorCell}>Valor Unit.</Text>
            <Text style={styles.valorCell}>Subtotal</Text>
          </View>

          {/* Linhas de Produtos */}
          {produtos.map((produto) => (
            <View key={produto.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{produto.nome}</Text>
              <Text style={styles.quantidadeCell}>{produto.quantidade}</Text>
              <Text style={styles.valorCell}>
                {formatarMoeda(produto.valorUnitario)}
              </Text>
              <Text style={styles.valorCell}>
                {formatarMoeda(produto.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <Text style={styles.total}>
          Valor Total: {formatarMoeda(valorTotal)}
        </Text>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text>Este documento é um resumo do pedido e não tem valor fiscal.</Text>
      </View>
    </Page>
  </Document>
);

export default PedidoPDF; 